#!/usr/bin/env node

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet, ExpScreenResultSet, ModelPredictedCountsResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../common/types/sdk/models";
import {range, isEqual, shuffle, filter} from 'lodash';

const path = require('path');
const fs = require('fs');

let search = {
      expWorkflowId: null
};


/**
 * Decided to add the expGroupId/expGroupId to the expAssay2reagent table
 * This script just pulls the expGroupId from the expAssay table,
 * and updates the corresponding expAssay2reagent table with the correct expGroupId
 */
countExpAssays()
  .then((paginationResults) => {
    return getPagedExpAssays(paginationResults)
  })
  .then(() => {
    console.log('finished!');
    process.exit(0)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

function getPagedExpAssays(paginationResults) {
  return new Promise((resolve, reject) => {
    Promise.map(paginationResults.pages, (page) => {
      let skip = Number(page) * Number(paginationResults.limit);
      console.log(`Page: ${page} Skip: ${skip}`);
      let data = {};
      return app.models.ExpAssay2reagent
        .find({
          limit: paginationResults.limit,
          skip: skip,
          where: search,
          // include: ['expManualScores'],
        })
        .then((results: ExpAssay2reagentResultSet[]) => {
          data['expAssay2reagents'] = results;
          // console.log(`Results Len : ${results.length}`);
          // console.log(JSON.stringify(results, null, 2));
          let or = results.map((row: ExpAssay2reagentResultSet) => {
            return {assayId: row.assayId};
          });
          return app.models.ExpAssay
            .find({
              where: {or: or},
            });
        }, {concurrency: 1})
        .then((results: ExpAssayResultSet[]) => {
          console.log('Found some expAssays');
          data['expAssays'] = results;
          return getExpAssay2reagent(results, data['expAssay2reagents']);
        })
        .then(() => {
          return;
        })
        .catch((error) => {
          return new Error(error);
        })
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
}

// TODO - should do this the other way around - get all the ExpAssay2reagent where they expGroupId is null FIRST
function getExpAssay2reagent(expAssays: ExpAssayResultSet[], expAssay2reagentsAll: ExpAssay2reagentResultSet[]) {
  console.log('In getExpAssay2reagent');
  // console.log(JSON.stringify(expAssay2reagentsAll[0], null, 2));
  return new Promise((resolve, reject) => {
    Promise.map(expAssays, (expAssay: ExpAssayResultSet) => {
      // console.log(JSON.stringify(expAssay));
      let expAssay2reagents = filter(expAssay2reagentsAll, (expAssay2reagent) => {
        return isEqual(Number(expAssay.assayId), Number(expAssay2reagent.assayId));
      });
      return updateExpAssay2reagent(expAssay, expAssay2reagents)
        .then((rows) => {
          return;
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

function updateExpAssay2reagent(expAssay: ExpAssayResultSet, expAssay2reagents: ExpAssay2reagentResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(expAssay2reagents, (expAssay2reagent: ExpAssay2reagentResultSet) => {
      expAssay2reagent.expGroupId = expAssay.expGroupId;
      expAssay2reagent.expWorkflowId = expAssay.expWorkflowId;
      if (expAssay.expGroupId) {
        console.log(`There is an expGroup ${expAssay.expGroupId}`);
        return app.models.ExpDesign.extract.workflows
          .getExpSets([{expGroupId: expAssay.expGroupId}])
          .then((results) => {
            if (!isEqual(expAssay2reagent.reagentType, 'ctrl_null') && !isEqual(expAssay2reagent.reagentType, 'ctrl_strain')) {
              expAssay2reagent.treatmentGroupId = results.expDesigns[0][0].treatmentGroupId;
            }
            return app.models.ExpAssay2reagent.upsert(expAssay2reagent)
          })
          .then((results) => {
            console.log(JSON.stringify(results));
            return;
          })
          .catch((error) => {
            console.log(error);
            reject(new Error(error));
          });
      } else {
        console.log('There is NO exp Group....');
        return app.models.ExpAssay2reagent
          .upsert(expAssay2reagent)
          .then((results) => {
            console.log(JSON.stringify(results));
            return;
          })
          .catch((error) => {
            console.log(error);
            reject(new Error(error));
          });
      }
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

function countExpAssays() {
  return new Promise((resolve, reject) => {
    app.models.ExpAssay2reagent
      .count(search)
      .then((count) => {
        let limit = 50;
        let numPages = Math.round(count / limit);
        let pages = range(0, numPages + 2);
        pages = shuffle(pages);
        console.log(`count is ${count}`);
        resolve({count: count, pages: pages, limit: limit});
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      })
  })
}

