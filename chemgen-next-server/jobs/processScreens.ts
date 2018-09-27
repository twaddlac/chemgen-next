#!/usr/bin/env node

import app = require('../server/server');
import jobQueues = require('./defineQueues');
import Promise = require('bluebird');

app.models.ExpScreenUploadWorkflow
  .find({
    where: {
      name: /CHEM Pr/,
    },
    limit: 10
  })
  .then((results) => {
    results.map((workflow) => {
      workflow.screenName = "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen";
      workflow.screenId = 9;
    });
    // @ts-ignore
    return Promise.map(results, (workflow) =>{
      return app.models.ExpScreenUploadWorkflow.upsert(workflow);
    })
      .then((results) =>{
        jobQueues.workflowQueue.add({workflowData: results});
      })
      .catch((error) =>{
        // reject(new Error(error));
        console.error(error);
      });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
