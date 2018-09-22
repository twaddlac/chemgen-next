#!/usr/bin/env node

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet,
  ExpAssayResultSet,
  ExpDesignResultSet, ExpGroupResultSet, ExpScreenResultSet, ModelPredictedCountsResultSet, RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../common/types/sdk/models";
import {range, isEqual, shuffle} from 'lodash';

const path = require('path');
const fs = require('fs');

countExpGroups()
  .then((paginationResults) => {
    return getPagedExpGroups(paginationResults)
  })
  .then(() => {
    console.log('finished!');
    process.exit(0)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getPagedExpGroups(paginationResults) {
  return new Promise((resolve, reject) => {
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      console.log(`Page: ${page} Skip: ${skip}`);
      return app.models.ExpGroup
        .find({
          limit: paginationResults.limit,
          skip: skip,
          where: {
            expGroupType: {
              like: 'ctrl%',
            }
          }
        })
        .then((results: ExpGroupResultSet[]) => {
          console.log(`Results Len : ${results.length}`);
          // console.log(JSON.stringify(results));
          return getExpDesign(results);
        })
        .catch((error) => {
          return new Error(error);
        })
    }, {concurrency: 1})
      .then(() => {
        // console.log(JSON.stringify(paginationResults.count));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function getExpDesign(expGroups: ExpGroupResultSet[]) {
  console.log('In getExpDesign');
  return new Promise((resolve, reject) => {
    Promise.map(expGroups, (expGroup: ExpGroupResultSet) => {
      // console.log(JSON.stringify(expGroup));
      return app.models.ExpDesign
        .find({
          where: {
            or: [
              {treatmentGroupId: expGroup.expGroupId},
              {controlGroupId: expGroup.expGroupId}
            ]
          }
        })
        .then((expDesignRows: ExpDesignResultSet[]) => {
          return updateExpDesign(expGroup, expDesignRows);
        })
        .catch((error) => {
          console.log(error);
          return new Error(error);
        });
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function updateExpDesign(expGroup: ExpGroupResultSet, expDesigns: ExpDesignResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(expDesigns, (expDesign: ExpDesignResultSet) => {
      if (isEqual(expDesign.controlGroupId, expGroup.expGroupId)) {
        expDesign.controlGroupReagentType = expGroup.expGroupType;
      }
      expDesign.expWorkflowId = expGroup.expWorkflowId;
      expDesign.screenId = expGroup.screenId;
      return app.models.ExpDesign
        .upsert(expDesign)
        .then((results) => {
          console.log(JSON.stringify(expGroup));
          console.log(JSON.stringify(results));
          return;
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

function countExpGroups() {
  return new Promise((resolve, reject) => {
    app.models.ExpGroup
      .count({
        and: [
          {
            expGroupType: {
              like: 'ctrl%',
            }
          }
        ]
      })
      .then((count) => {
        let limit = 100;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        pages = shuffle(pages);
        console.log(`count is ${count}`);
        // pagination(1, count, 50);
        // console.log(`Pages: ${Math.round(count / 50)}`);
        // console.log(JSON.stringify(pages));
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}

