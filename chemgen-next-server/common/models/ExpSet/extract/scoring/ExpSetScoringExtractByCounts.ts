import app  = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {divide, isNull, isUndefined, isEmpty, camelCase} from 'lodash';
import {ExpSetSearch, ExpSetSearchByCounts, ExpSetSearchByCountsInterface, ExpSetSearchResults} from "../../types";
import {
  ChemicalLibraryResultSet, ExpAssay2reagentResultSet, ModelPredictedCountsResultSet,
  RnaiLibraryResultSet
} from "../../../../types/sdk/models";
import decamelize = require('decamelize');

import config = require('config');
const knex = config.get('knex');


/**
 * ExpSetExtractScoring* are a list of apis to get ExpSets for scoring
 */

/**
 * ExpSetScoringExtractByCounts - extract various ExpSets, and order by counts
 * Possible order values are
 * percEmbLeth, percSter, broodSize, wormCount, larvaCount, eggCount
 */

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * Grab ExpSets that do not have a manual score
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByCounts = function (search: ExpSetSearchByCounts) {
  return new Promise((resolve, reject) => {

    search = new ExpSetSearchByCounts(search);
    let data = new ExpSetSearchResults({});

    let sqlQuery = ExpSet.extract.buildNativeQueryCounts(data, search, false);
    sqlQuery = sqlQuery.count();

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getCountsByScores(data, search);
      })
      .then((data: ExpSetSearchResults) => {
        if (isEmpty(data.modelPredictedCounts)) {
          return data;
        } else {
          return app.models.ExpAssay2reagent
            .find({
              where: {
                assayId: {
                  inq: data.modelPredictedCounts.map((modelPredictedCount: ModelPredictedCountsResultSet) => {
                    return modelPredictedCount.assayId;
                  })
                }
              }
            })
            .then((expAssay2reagents) => {
              data.expAssay2reagents = expAssay2reagents;
              return data;
            })
            .then((data: ExpSetSearchResults) => {
              return app.models.ExpSet.extract.buildExpSets(data, search);
            })
            .catch((error) => {
              return new Error(error);
            })
        }
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.getCountsByScores = function (data: ExpSetSearchResults, search: ExpSetSearchByCounts, scoresExist: Boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQueryCounts(data, search, scoresExist);

    //Add Pagination
    if (search.orderBy) {
      sqlQuery = sqlQuery
        .orderByRaw(`${decamelize(search.orderBy)} ${search.order}`)
    }
    sqlQuery = sqlQuery
      .limit(data.pageSize)
      .offset(data.skip);

    console.log(`SqlQuery: ${sqlQuery.toString()}`);

    let ds = app.datasources.chemgenDS;
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
          return new app.models.ModelPredictedCounts(JSON.parse(JSON.stringify(rawRowData)));
        });
        data.skip = data.skip + data.pageSize;
        data.modelPredictedCounts = rowData;
        return resolve(data);
      }
    });
  });
};

ExpSet.extract.buildNativeQueryCounts = function (data: ExpSetSearchResults, search: ExpSetSearchByCounts, hasManualScores: Boolean) {
  let query = knex('model_predicted_counts');

  //Just get the treatment groups
  //The rest get pulled in during the build ExpSets
  query = query
    .where('exp_group_type', 'LIKE', 'treat%')
    .whereNot({exp_group_id: null});

  //Add Base experiment lookup
  ['screen', 'model', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  //Get if value exists in the manual score table
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('model_predicted_counts.treatment_group_id = exp_manual_scores.treatment_group_id');
      });
  } else {
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('model_predicted_counts.treatment_group_id = exp_manual_scores.treatment_group_id');
      });
  }
  return query;
};
