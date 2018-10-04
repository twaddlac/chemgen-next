import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {groupBy, shuffle, isEqual, find, get, filter, memoize, orderBy, camelCase, round, isObject} from 'lodash';
import {interpolateYlOrBr, interpolateViridis} from 'd3';
import {ExpSetSearch, ExpSetSearchResults} from "../../types";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet,
  ExpAssayResultSet, ExpDesignResultSet, ExpManualScoreCodeResultSet, ExpManualScoresResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet,
  ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet,
  RnaiLibraryResultSet
} from "../../../../types/sdk/models";
import decamelize = require('decamelize');

import config = require('config');

let knex = config.get('knex');

import redis = require('redis');
// @ts-ignore
Promise.promisifyAll(redis);
const redisClient = redis.createClient(config.get('redisUrl'));

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * Grab ExpSets that do not have a manual score and organize by plate
 * This one is a little different from the other ExpSet function, which assume that the user wants to see all the replicates together
 * Instead the user independently scores each plate
 * So we can just use the expWorkflowId to do all the lookups
 * This is not same as the others - where we may be searching for a gene/chemical across all the screens
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByPlate = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});

    // data.pageSize = 1;

    let sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
    sqlQuery = sqlQuery.count();

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getExpPlatesByScores(data, search, false);
      })
      .then((data: ExpSetSearchResults) => {
        if (!data.expPlates || !data.expPlates.length) {
          resolve();
        } else {
          return ExpSet.extract.fetchFromCache(data, search, data.expPlates[0].expWorkflowId);
        }
      })
      .then((data: ExpSetSearchResults) => {
        // Check to see if it was fetched from the cache
        if (!data.fetchedFromCache) {
          return ExpSet.extract.getExpDataByExpWorkflowId(data, search, data.expPlates[0].expWorkflowId);
        } else {
          return data;
        }

      })
      .then((data: ExpSetSearchResults) => {
        //ExpManualScores and ModelPredictedCounts do NOT go in the cache
        return ExpSet.extract.getExpManualScoresByExpWorkflowId(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        // TODO Could probably cache the counts,
        // just have to make sure there is one count record per AssayId
        return ExpSet.extract.getModelPredictedCountsByExpWorkflowId(data, search);
      })
      .then((data) => {
        data = ExpSet.extract.insertCountsDataImageMeta(data);
        data = ExpSet.extract.insertExpManualScoresImageMeta(data);
        data = ExpSet.extract.genAlbumsByPlate(data, search);
        // data = ExpSet.extract.cleanUp(data, search);
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.getExpPlatesByScores = function (data: ExpSetSearchResults, search: ExpSetSearch, scoresExist: boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, scoresExist);
    sqlQuery = sqlQuery
      .limit(1000);

    let ds = app.datasources.chemgenDS;
    app.winston.info(JSON.stringify(sqlQuery.toString()));
    ds.connector.execute(sqlQuery.toString(), [], function (error, rows) {
      if (error) {
        app.winston.error(error);
        return reject(new Error(error));
      } else {
        const rowData = rows.map(rawRowData => {
          Object.keys(rawRowData).map((rowKey) => {
            rawRowData[camelCase(rowKey)] = rawRowData[rowKey];
            delete rawRowData[rowKey];
          });
          return new app.models.ExpPlate(JSON.parse(JSON.stringify(rawRowData)));
        });
        data.skip = data.skip + data.pageSize;
        data.expPlates = [shuffle(rowData)[0]];
        return resolve(data);
      }
    });
  });
};

ExpSet.extract.getModelPredictedCountsByExpWorkflowId = function (data: ExpSetSearchResults, search) {
  return new Promise((resolve, reject) => {
    app.models.ModelPredictedCounts
      .find({
        where: {
          expWorkflowId: data.expWorkflows[0].id,
        }
      })
      .then((modelPredictedCounts: ModelPredictedCountsResultSet[]) => {
        data.modelPredictedCounts = modelPredictedCounts;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpManualScoresByExpWorkflowId = function (data: ExpSetSearchResults, search) {
  return new Promise((resolve, reject) => {
    app.models.ExpManualScores
      .find({
        where: {
          expWorkflowId: data.expWorkflows[0].id,
        }
      })
      .then((expManualScores: ExpManualScoresResultSet[]) => {
        data.expManualScores = expManualScores;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    if (!data.expAssay2reagents || !data.expAssay2reagents.length) {
      resolve(data);
    } else {
      app.models.ExpAssay2reagent
        .find({
          where: {
            and: [{expWorkflowId: data.expAssay2reagents[0].expWorkflowId},
              {reagentId: {neq: null}},
            ]
          },
          fields: {
            treatmentGroupId: true,
            assay2reagentId: true,
            expGroupId: true,
            plateId: true,
            assayId: true,
            reagentId: true,
            libraryId: true,
            reagentType: true,
            reagentTable: true,
          },
        })
        .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
          let groups = groupBy(expAssay2reagents, 'reagent_type');
          ['ctrl_null', 'ctrl_strain'].map((expGroupType: string) => {
            groups[expGroupType] = shuffle(groups[expGroupType]);
            groups[expGroupType] = groups[expGroupType].slice(0, search.ctrlLimit);
          });

          Object.keys(groups).map((expGroupType) => {
            groups[expGroupType].map((expAssay2reagent: ExpAssay2reagentResultSet) => {
              data.expAssay2reagents.push(expAssay2reagent);
            });
          });

          return data;
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    }
  });
};

/**
 * This is the main workflow to get the Data
 * It includes ExpPlates, ExpScreens, ExpScreenWorkflows
 * Counts and Scores are separate
 * @param data
 * @param search
 */
ExpSet.extract.getExpDataByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch, expWorkflowId: string) {
  return new Promise((resolve, reject) => {
    app.models.ExpAssay2reagent
      .find({
        where: {
          and: [
            {expWorkflowId: expWorkflowId},
            {expGroupId: {neq: null}},
          ]
        },
        fields: {
          treatmentGroupId: true,
          assay2reagentId: true,
          expGroupId: true,
          plateId: true,
          assayId: true,
          reagentId: true,
          libraryId: true,
          reagentType: true,
          reagentTable: true,
          expWorkflowId: true,
        },
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        data.expAssay2reagents = expAssay2reagents;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpAssay
          .find({
            where: {
              assayId: {
                inq: data.expAssay2reagents.map((expAssay2reagent) => {
                  return expAssay2reagent.assayId;
                })
              }
            },
            fields: {
              assayWell: true,
              assayId: true,
              assayImagePath: true,
              expGroupId: true,
              plateId: true,
              screenId: true,
              expWorkflowId: true,
            },
          })
      })
      .then((expAssays: ExpAssayResultSet[]) => {
        data.expAssays = expAssays;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpPlate
          .find({
            where: {
              expWorkflowId: expWorkflowId,
            }
          })
      })
      .then((expPlates: ExpPlateResultSet[]) => {
        data.expPlates = expPlates;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ModelPredictedCounts
          .find({
            where: {
              expWorkflowId: expWorkflowId
            }
          })
      })
      .then((modelPredictedCounts: ModelPredictedCountsResultSet[]) => {
        data.modelPredictedCounts = modelPredictedCounts;
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpScreen
          .findOne({
            where: {screenId: data.expPlates[0].screenId},
            fields: {
              screenId: true,
              screenName: true,
              screenType: true,
              screenStage: true,
            }
          })
      })
      .then((expScreens: ExpScreenResultSet) => {
        data.expScreens = [expScreens];
        return data;
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpScreenUploadWorkflow
          .findOne({
            where: {id: expWorkflowId},
            fields: {
              id: true,
              name: true,
              screenId: true,
              biosamples: true,
              assayDates: true,
              temperature: true,
              screenType: true,
              screenStage: true
            }
          })
      })
      .then((expScreenWorkflow: ExpScreenUploadWorkflowResultSet) => {
        app.winston.info(`Got through getExpSetData`);
        data.expWorkflows = [expScreenWorkflow];
        return ExpSet.extract.getExpDesignsByExpWorkflowId(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.genExpSetAlbums(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getReagentData(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
        return ExpSet.extract.saveToCache(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        app.winston.info(`Got through getExpSetData`);
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

ExpSet.extract.fetchFromCache = function (data: ExpSetSearchResults, search: ExpSetSearch, expWorkflowId: string) {
  return new Promise((resolve, reject) => {
    //TODO Should just pass ine ither the key or the expWorkflowId
    let key = `expSets-expWorkflowId-${expWorkflowId}`;

    redisClient.getAsync(key)
      .then((obj) => {
        if (obj) {
          // data = JSON.parse(obj);
          // data.fetchedFromCache = true;
          data.fetchedFromCache = false;
          resolve(data);
        } else {
          data.fetchedFromCache = false;
          resolve(data);
        }
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

ExpSet.extract.saveToCache = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let key = `expSets-expWorkflowId-${data.expWorkflows[0].id}`;
    redisClient.set(key, JSON.stringify(data), 'EX', 60 * 60 * 24, function (err, reply) {
      resolve(data);
    });
  });
};

ExpSet.extract.getExpDesignsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ExpDesign
      .find({where: {expWorkflowId: data.expPlates[0].expWorkflowId}})
      .then((expDesigns: ExpDesignResultSet[]) => {
        let groups = groupBy(expDesigns, 'treatmentGroupId');
        data.expSets = Object.keys(groups).map((treatmentGroupId) => {
          return groups[treatmentGroupId];
        });
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * Counts goes in its own separate corner,
 * because counts can be updated
 * @param data
 * @param search
 */
ExpSet.extract.getCountsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    if (!search.includeCounts) {
      resolve(data);
    } else {
      app.models.ModelPredictedCounts
        .find(
          {
            where: {
              expWorkflowId: data.expPlates[0].expWorkflowId,
            }
          }
        )
        .then((results: ModelPredictedCountsResultSet[]) => {
          data.modelPredictedCounts = results;
          resolve(data);
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    }
  });
};

//TODO Add this to main ExpSetModule
ExpSet.extract.genExpGroupTypeAlbums = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  //For the expSet albums limit to 4
  data.albums.map((album) => {
    ['ctrlNullImages', 'ctrlStrainImages'].map((albumType) => {
      album[albumType] = shuffle(album[albumType].slice(0, search.ctrlLimit));
    });
  });

  let expGroupTypes: any = groupBy(data.expAssay2reagents, 'reagentType');
  Object.keys(expGroupTypes).map((expGroup: string) => {
    let mappedExpGroup = ExpSet.extract.mapExpGroupTypes(expGroup);
    expGroupTypes[mappedExpGroup] = expGroupTypes[expGroup];
    expGroupTypes[mappedExpGroup] = ExpSet.extract.genImageMeta(data, expGroupTypes[mappedExpGroup]);
    if (isEqual(mappedExpGroup, 'ctrlNull') || isEqual(mappedExpGroup, 'ctrlStrain')) {
      expGroupTypes[mappedExpGroup].map((imageMeta: any) => {
        imageMeta.treatmentGroupId = null;
      });
    }
    delete expGroupTypes[expGroup];
  });
  data.expGroupTypeAlbums = expGroupTypes;
  //End Cache here
  return data;
};

ExpSet.extract.genAlbumsByPlate = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  ['treatReagent', 'ctrlReagent'].map((mappedExpGroup) => {
    data.expGroupTypeAlbums[mappedExpGroup] = groupBy(data.expGroupTypeAlbums[mappedExpGroup], 'plateId');
  });

  data = ExpSet.extract.extractPlatesNoScore(data, search);
  return data;
};

/**
 * Find the first set of plates that has no score
 * This seems like a stupidly complex way of doing this
 * TODO Think of a better way to do this
 * @param data
 * @param search
 */
ExpSet.extract.extractPlatesNoScore = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let scoredPlateIds = [];
  let unScoredPlateIds = [];
  Object.keys(data.expGroupTypeAlbums.treatReagent).map((tplateId) => {
    let foundAssay = find(data.expGroupTypeAlbums.treatReagent[tplateId], {manualScoreByAssay: null});
    // This plate was already scored!
    if (!foundAssay) {
      scoredPlateIds.push(tplateId);
    } else {
      unScoredPlateIds.push(tplateId);
    }
  });

  // let treatReagentPlateIds = Object.keys(data.expGroupTypeAlbums.treatReagent);
  let ctrlReagentPlateIds = Object.keys(data.expGroupTypeAlbums.ctrlReagent);

  // TODO Add condition for all plates scores (which shouldn't happen)
  // Get a single plate to score
  let scoreThisPlate = unScoredPlateIds.shift();
  const treatI = Object.keys(data.expGroupTypeAlbums.treatReagent).indexOf(scoreThisPlate);

  // Most of the time N2s have the same number of replicates as the mel-28
  // But sometimes they don't
  // If they don't just get the last n2 plate and call it a day
  let ctrlPlateId = null;
  if (treatI < ctrlReagentPlateIds.length) {
    ctrlPlateId = ctrlReagentPlateIds[treatI];
  } else {
    ctrlPlateId = ctrlReagentPlateIds.pop();
  }

  data.expGroupTypeAlbums.treatReagent = data.expGroupTypeAlbums.treatReagent[scoreThisPlate];
  data.expGroupTypeAlbums.ctrlReagent = data.expGroupTypeAlbums.ctrlReagent[ctrlPlateId];
  data.expGroupTypeAlbums.treatReagent = orderBy(data.expGroupTypeAlbums.treatReagent, 'well');
  data.expGroupTypeAlbums.ctrlReagent = orderBy(data.expGroupTypeAlbums.ctrlReagent, 'well');

  return data;
};

