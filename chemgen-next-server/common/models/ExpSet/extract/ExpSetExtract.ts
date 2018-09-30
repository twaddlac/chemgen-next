import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet,
} from "../../../types/sdk/models/index";
import {
  find,
  uniqBy,
  isEqual,
  slice,
  shuffle,
  isEmpty,
  uniq,
} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../types";

import config = require('config');
const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 *  ExpSetSearch the expAssay2reagents table given the search results
 *  From there get assays, and get includeCounts
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.searchExpAssay2reagents = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let expAssay2reagentSearch = app.models.ExpSet.extract.buildExpAssay2reagentSearch(data, search);

    app.models.ExpAssay2reagent
      .find(expAssay2reagentSearch)
      .then((results) => {
        data.expAssay2reagents = results;
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * Build the 'where' query against the ExpAssay2reagent table (the main experiment table)
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 * @returns {any[]}
 */
ExpSet.extract.buildQuery = function (data: ExpSetSearchResults, search: ExpSetSearch) {

  let or = [];

  let expOr = ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let searchObject = {};
      searchObject[`${searchType}Id`] = {inq: search[`${searchType}Search`]};
      return searchObject;
    }
  }).filter((or) => {
    return or;
  });
  ['rnai', 'compounds'].map((reagentType) => {
    if (!isEmpty(data[`${reagentType}sList`])) {
      data[`${reagentType}sList`].map((Row) => {
        let obj: any = {
          and: [
            {reagentId: Row[`${reagentType}Id`]},
            {libraryId: Row.libraryId},
          ]
        };

        expOr.map((exp) => {
          obj.and.push(exp);
        });
        or.push(obj);
      });
    } else {
      let obj: any = {
        and: []
      };
      expOr.map((exp) => {
        obj.and.push(exp);
      });
      or.push(obj);
    }
  });

  return or;
};

ExpSet.extract.buildExpAssay2reagentSearch = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  let or = ExpSet.extract.buildQuery(data, search);
  return {
    where: {or: or, reagentId: {'neq': null}},
    limit: data.pageSize,
    skip: data.skip,
    // skip: search.currentPage * search.pageSize,
    fields: {
      assay2reagentId: true,
      reagentType: true,
      expGroupId: true,
      plateId: true,
      assayId: true,
      reagentId: true,
      libraryId: true
    },
  };
};

/**
 * This only builds the most basic pagination
 * It does not do any filtering for assays that already have scores
 * Or ordering expAssays by any rank
 * To do eithe of these things see ExpSet.extract.workflows.scoring
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildBasicPaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let or = app.models.ExpSet.extract.buildQuery(data, search);
    app.paginateModel('ExpAssay2reagent', {or: or}, search.pageSize)
      .then((pagination) => {
        data.currentPage = search.currentPage;
        data.skip = search.skip;
        data.pageSize = search.pageSize;
        data.totalPages = pagination.totalPages;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * This is the main workflow
 * Once we have a set of expAssay2reagents, get the corresponding expAssays, includeCounts, expPlates, expScreens, and expWorkflows
 * Also generate an album for use in the interface
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildExpSets = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    //TODO Ensure there are expAssayIds!
    if (isEmpty(data.expAssay2reagents)) {
      app.winston.error(JSON.stringify(data, null, 2));
      resolve(data);
      // reject(new Error('invalid data - no expAssay2reagents'));
    }

    // let expAssayIds = data.expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
    //   return {assayId: expAssay2reagent.assayId};
    // });
    // This ONLY returns the treat_rnai and ctrl_rnai  expGroups
    // ctrl_null and ctrl_strain are L4440s and don't have a reagentId
    app.models.ExpAssay
      .find({
        where: {
          assayId: {
            inq: data.expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
              return expAssay2reagent.assayId;
            })
          }
        },
        fields: {
          screenId: true,
          expWorkflowId: true,
          expGroupId: true,
          assayImagePath: true,
          plateId: true,
          assayId: true
        },
      })
      .then((results: ExpAssayResultSet[]) => {
        //TODO if returning includeCounts also return ExpAssay is redundent
        // data['expAssays'] = results;
        data.expAssays = results;
        let expGroupIds = results.map((expAssay: ExpAssayResultSet) => {
          return {expGroupId: expAssay.expGroupId};
        });
        return app.models.ExpDesign.extract.workflows.getExpSets(expGroupIds);
      })
      .then((results: any) => {
        data.expSets = results.expDesigns;
        return ExpSet.extract.sanityChecks(data, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.getCounts(results, search);
      })
      .then((results: ExpSetSearchResults) => {
        return ExpSet.extract.getExpData(results, search);
      })
      .then((data: ExpSetSearchResults) => {
        data = ExpSet.extract.genExpSetAlbums(data, search);
        data = ExpSet.extract.genExpGroupTypeAlbums(data, search);
        data = ExpSet.extract.insertCountsDataImageMeta(data);
        data = ExpSet.extract.insertExpManualScoresImageMeta(data);
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

/**
 * Depending on how the search is run (genes list, expGroup, etc)
 * We may be missing different pieces of data
 * For instance if we search by expGroup=1, up to here only expAssay2Reagent with expGroup=1 will be returned
 * Or if searching for genes we won't have any L4440s
 * So this is a very brute force approach to ensure there is no data missing
 * But we want the whole expSet
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.sanityChecks = function (data: ExpSetSearchResults, search ?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    // This gets the ctrl_null and ctrl_strain includeCounts
    let ctrlExpGroupIds = [];
    let treatExpGroupIds = [];
    data.expSets.map((expSet) => {
      expSet.map((expDesign: ExpDesignResultSet) => {
        ctrlExpGroupIds.push({expGroupId: expDesign.controlGroupId});
        treatExpGroupIds.push({expGroupId: expDesign.treatmentGroupId});
      });
    });

    ctrlExpGroupIds = uniqBy(ctrlExpGroupIds, 'expGroupId');

    // @ts-ignore
    Promise.map(ctrlExpGroupIds, (ctrlExpGroupId) => {
      return app.models.ExpAssay
        .find({
          where: ctrlExpGroupId,
          limit: 10,
          fields: {
            plateId: true,
            screenId: true,
            expWorkflowId: true,
            expGroupId: true,
            assayImagePath: true,
            assayId: true
          },
        })
        .then((results: ExpAssayResultSet[]) => {
          results = shuffle(results);
          results = slice(results, 0, search.ctrlLimit);
          results.map((result) => {
            data.expAssays.push(result);
          });
          return;
        })
        .catch((error) => {
          app.winston.error(error);
          return new Error(error);
        })
    })
      .then(() =>{
        return app.models.ExpAssay
          .find({
            where: {
              expGroupId: {
                inq: treatExpGroupIds.map((expGroup : any) =>{
                  return expGroup.expGroupId;
                }),
              }
            }
          });
      })
      .then((expAssays: ExpAssayResultSet[]) =>{
        expAssays.map((expAssay) =>{
          data.expAssays.push(expAssay);
        });
        data.expAssays = uniqBy(data.expAssays, 'assayId');
      })
      .then(() => {
        return app.models.ExpAssay2reagent
          .find({
            where: {
              assayId: {
                inq: data.expAssays.map((expAssay) => {
                  return expAssay.assayId;
                }),
              },
              reagentId: {'neq': null}
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
            },
          })
      })
      .then((results: ExpAssay2reagentResultSet[]) => {
        results.map((result) => {
          data.expAssay2reagents.push(result);
        });
        data.expAssay2reagents = uniqBy(data.expAssay2reagents, 'assay2reagentId');
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};

/**
 * Get the experimental data for this
 * ExpPlate, expScreen, and batchName
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.getExpData = function (data: ExpSetSearchResults, search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ExpPlate
      .find({
        where: {
          plateId: {
            inq: data.expAssays.map((expAssay) => {
              return expAssay.plateId;
            }),
          }
        },
        fields: {
          plateId: true,
          instrumentPlateId: true,
          temperature: true,
          screenId: true,
          expWorkflowId: true,
          barcode: true,
        }
      })
      .then((expPlateResults: ExpPlateResultSet[]) => {
        data.expPlates = expPlateResults;
        return app.models.ExpScreen
          .find({
            where: {
              screenId: {
                inq: data.expPlates.map((expPlate) => {
                  return expPlate.screenId;
                })
              }
            }
          })
      })
      .then((expScreenResults: ExpScreenResultSet[]) => {
        data.expScreens = expScreenResults;

        return app.models.ExpScreenUploadWorkflow
          .find({
            where: {
              id: {
                inq: data.expAssays.map((expAssay) => {
                  return expAssay.expWorkflowId;
                })
              }
            },
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
      .then((expWorkflowResults: ExpScreenUploadWorkflowResultSet[]) => {
        data.expWorkflows = expWorkflowResults;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      })
  });
};

ExpSet.extract.getCounts = function (data: ExpSetSearchResults, search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    if (!search.includeCounts) {
      resolve(data);
    } else {
      app.models.ModelPredictedCounts
        .find(
          {
            where: {
              assayId: {
                inq: data.expAssays.map((expAssay) => {
                  return expAssay.assayId;
                }),
              }
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

ExpSet.extract.genExpSetAlbums = function (data?: ExpSetSearchResults, search?: ExpSetSearch) {
  if (!search.includeAlbums) {
    return data;
  } else {
    data.expSets.map((expSet) => {
      let album: any = {};
      album.expWorkflowId = expSet[0].expWorkflowId;
      album.treatmentReagentId = expSet[0].treatmentGroupId;
      album.treatmentGroupId = expSet[0].treatmentGroupId;
      try {
        album.ctrlReagentId = find(expSet, (set: ExpDesignResultSet) => {
          return isEqual(set.controlGroupReagentType, 'ctrl_rnai') || isEqual(set.controlGroupReagentType, 'ctrl_compound') || isEqual(set.controlGroupReagentType, 'ctrl_chemical');
        }).controlGroupId;
      } catch (error) {
        app.winston.error('There is no ctrl for the reagent!');
      }
      try {
        album.ctrlStrainId = find(expSet, (set: ExpDesignResultSet) => {
          return isEqual(set.controlGroupReagentType, 'ctrl_strain');
        }).controlGroupId;
      } catch (error) {
        app.winston.error('There is no ctrl strain');
      }
      try {
        album.ctrlNullId = find(expSet, (set: ExpDesignResultSet) => {
          return isEqual(set.controlGroupReagentType, 'ctrl_null');
        }).controlGroupId;
      } catch (error) {
        app.winston.error('There is no ctrl null');
      }

      ['treatmentReagent', 'ctrlReagent', 'ctrlStrain', 'ctrlNull'].map((expGroupType) => {
        album[`${expGroupType}Images`] = data.expAssays.filter((expAssay: ExpAssayResultSet) => {
          return isEqual(expAssay.expGroupId, album[`${expGroupType}Id`]);
        }).map((expAssay: ExpAssayResultSet) => {
          return  {
            assayImagePath: expAssay.assayImagePath,
            src: `${config.get('imageUrl')}/${expAssay.assayImagePath}-autolevel.jpeg`,
            caption: `Image ${expAssay.assayImagePath} caption here`,
            thumb: `${config.get('imageUrl')}/${expAssay.assayImagePath}-autolevel.jpeg`,
          };
        });
        album[`${expGroupType}Images`] = uniqBy(album[`${expGroupType}Images`], 'assayImagePath');
      });

      data.albums.push(album);
    });

    return data;
  }
};

