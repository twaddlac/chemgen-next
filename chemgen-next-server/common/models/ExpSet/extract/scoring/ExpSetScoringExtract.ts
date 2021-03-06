import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {divide, isNull, isUndefined, isEmpty, camelCase} from 'lodash';
import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import {ChemicalLibraryResultSet, ExpAssay2reagentResultSet, RnaiLibraryResultSet} from "../../../../types/sdk/models";
import decamelize = require('decamelize');

import * as client from "knex";

import config = require('config');

const knex = config.get('knex');

/**
 * ExpSetExtractScoring* are a list of apis to get ExpSets for scoring
 */

/**
 * The ExpSetExtractScoring* libraries require more complex sql functionality than given by loopback alone
 * (loopback does not support exists, min, max, nested sql, etc)
 * For this reason we use knex, to generate the sql, and then execute it with the loopback native sql executor
 */

const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * Grab ExpSets that do not have a manual score
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSets = function (search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});

    if (!search.scoresExist) {
      search.scoresExist = false;
    }

    let sqlQuery = ExpSet.extract.buildNativeQuery(data, search, search.scoresExist);
    sqlQuery = sqlQuery.count();

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, search.scoresExist);
      })
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpSet.extract.buildExpSets(data, search);
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpSet.extract.workflows.getExpAssay2reagentsByScores = function (data: ExpSetSearchResults, search: ExpSetSearch, scoresExist: Boolean) {
  return new Promise((resolve, reject) => {
    let sqlQuery = ExpSet.extract.buildNativeQuery(data, search, scoresExist);

    //Add Pagination
    //TODO Orderby RAND() May be making a big performance hit
    //A much faster way to do this would be to get all the expWorkflowIds that match the query
    //Then get the ones that haven't been scored
    sqlQuery = sqlQuery
    // .orderByRaw('RAND()')
      .limit(data.pageSize)
      .offset(data.skip);

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
          return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
        });
        data.skip = data.skip + data.pageSize;
        data.expAssay2reagents = rowData;
        return resolve(data);
      }
    });

  });
};

ExpSet.extract.buildUnscoredPaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch, sqlQuery: string) {
  return new Promise((resolve, reject) => {
    let ds = app.datasources.chemgenDS;
    ds.connector.execute(sqlQuery, [], function (error, rows) {
      if (error) {
        reject(new Error(error));
      } else {
        let count = rows[0]["count(*)"];
        let totalPages = Math.round(divide(Number(count), Number(search.pageSize)));
        data.currentPage = search.currentPage;
        data.pageSize = search.pageSize;
        data.skip = search.skip;
        data.totalPages = totalPages;
        resolve(data);
      }
    });
  });
};

/**
 * The expPlates will have much fewer contactSheetResults, and so it will be faster to query, and more possible to pull a random plate for scoring
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {

  let query = knex('exp_assay2reagent');
  query = query
    .distinct('exp_workflow_id')
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});
  //Add Base experiment lookup
  ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  //Add Rnai reagent Lookup
  if (!isEmpty(data.rnaisList)) {
    query = query
      .where(function () {
        let firstVal: RnaiLibraryResultSet = data.rnaisList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId});
        data.rnaisList.map((rnai: RnaiLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: rnai.rnaiId, library_id: firstVal.libraryId});
        });
        data.rnaisList.push(firstVal);
      })
  }

  //Add Chemical Lookup
  if (!isEmpty(data.compoundsList)) {
    query = query
      .where(function () {
        let firstVal: ChemicalLibraryResultSet = data.compoundsList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId});
        data.compoundsList.map((compound: ChemicalLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: compound.compoundId, library_id: firstVal.libraryId});
        });
        data.compoundsList.push(firstVal);
      })
  }

  //Get if value exists in the manual score table
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });
  } else {
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });

  }
  // let query = knex('exp_plate');
  //
  // ['screen', 'expWorkflow', 'plate'].map((searchType) => {
  //   if (!isEmpty(search[`${searchType}Search`])) {
  //     let sql_col = decamelize(`${searchType}Id`);
  //     let sql_values = search[`${searchType}Search`];
  //     query = query.whereIn(sql_col, sql_values);
  //   }
  // });
  //
  // //Get if value exists in the manual score table
  // if (hasManualScores) {
  //   query = query
  //     .whereExists(function () {
  //       this.select(1)
  //         .from('exp_manual_scores')
  //         .whereRaw('exp_plate.exp_workflow_id = exp_manual_scores.exp_workflow_id');
  //     });
  // } else {
  //   query = query
  //     .whereNotExists(function () {
  //       this.select(1)
  //         .from('exp_manual_scores')
  //         .whereRaw('exp_plate.exp_workflow_id = exp_manual_scores.exp_workflow_id');
  //     });
  //
  // }

  return query;
};

/**
 * This query will find a single assay that hasn't been scored
 * CAUTION - A query will NOT show up here if the entire expSet was toggled instead of the assays individually
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQuery = function (data: ExpSetSearchResults, search: ExpSetSearch, hasManualScores: Boolean) {
  let query = knex('exp_assay2reagent');
  query = query
    .where('reagent_type', 'LIKE', 'treat%')
    .whereNot({reagent_id: null});
  //Add Base experiment lookup
  ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map((searchType) => {
    if (!isEmpty(search[`${searchType}Search`])) {
      let sql_col = decamelize(`${searchType}Id`);
      let sql_values = search[`${searchType}Search`];
      query = query.whereIn(sql_col, sql_values);
    }
  });

  //Add Rnai reagent Lookup
  if (!isEmpty(data.rnaisList)) {
    query = query
      .where(function () {
        let firstVal: RnaiLibraryResultSet = data.rnaisList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId});
        data.rnaisList.map((rnai: RnaiLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: rnai.rnaiId, library_id: firstVal.libraryId});
        });
        data.rnaisList.push(firstVal);
      })
  }

  //Add Chemical Lookup
  if (!isEmpty(data.compoundsList)) {
    query = query
      .where(function () {
        let firstVal: ChemicalLibraryResultSet = data.compoundsList.shift();
        let firstWhere = this.orWhere({'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId});
        data.compoundsList.map((compound: ChemicalLibraryResultSet) => {
          firstWhere = firstWhere.orWhere({reagent_id: compound.compoundId, library_id: firstVal.libraryId});
        });
        data.compoundsList.push(firstVal);
      })
  }

  //Get if value exists in the manual score table
  if (hasManualScores) {
    query = query
      .whereExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });
  } else {
    query = query
      .whereNotExists(function () {
        this.select(1)
          .from('exp_manual_scores')
          .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
      });

  }

  return query;
};
