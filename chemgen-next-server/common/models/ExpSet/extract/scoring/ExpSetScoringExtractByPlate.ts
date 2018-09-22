import app = require('../../../../../server/server.js');
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {groupBy, shuffle, uniq, divide, isNull, isUndefined, isEmpty, camelCase} from 'lodash';
import {ExpSetSearch, ExpSetSearchResults} from "../../types";
import {ChemicalLibraryResultSet, ExpAssay2reagentResultSet, RnaiLibraryResultSet} from "../../../../types/sdk/models";
import decamelize = require('decamelize');

import * as client from "knex";

let knex: client = client({
  client: 'mysql',
  connection: {
    host: process.env.CHEMGEN_HOST,
    user: process.env.CHEMGEN_USER,
    password: process.env.CHEMGEN_PASS,
    database: process.env.CHEMGEN_DB,
  },
  debug: true,
});

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
    console.log(`Before: ${JSON.stringify(search)}`);
    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});
    console.log(`After: ${JSON.stringify(search)}`);

    let sqlQuery = ExpSet.extract.buildNativeQuery(data, search, false);
    sqlQuery = sqlQuery.count();

    data.pageSize = 1;

    ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
      .then((data: ExpSetSearchResults) => {
        //Get the plate - and then get all plates in that expSet
        // return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, false);
        return ExpSet.extract.getExpAssay2reagentsByExpWorkflowId(data, search);
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

ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    app.models.ExpAssay2reagent
      .find({
        where: {
          and: [{expWorkflowId: data.expAssay2reagents[0].expWorkflowId},
            {reagentId: {neq: null}},
          ]
        }
      })
      .then((expAssay2reagents: ExpAssay2reagentResultSet[]) => {
        let groups = groupBy(expAssay2reagents, 'reagent_type');
        ['ctrl_null', 'ctrl_strain'].map((expGroupType: string) =>{
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
        reject(new Error(error));
      });
  });
};
