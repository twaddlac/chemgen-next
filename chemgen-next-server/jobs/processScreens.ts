#!/usr/bin/env node

import app = require('../server/server');
import jobQueues = require('./defineQueues');
import Promise = require('bluebird');

app.models.ExpScreenUploadWorkflow
  .find({
    where: {
      name: /CHEM/,
    },
    limit: 5
  })
  .then((results) => {
    results.map((workflow) => {
      app.winston.info(`Queuing: ${workflow.name}`);
      workflow.screenName = "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen";
      workflow.screenId = 9;
    });
    // @ts-ignore
    return Promise.map(results, (workflow) => {
      return app.models.ExpScreenUploadWorkflow.upsert(workflow);
    })
      .then((results) => {
        //@ts-ignore
        Promise.map(results, (result) => {
          jobQueues.workflowQueue.add({workflowData: result});
        })
          .then(() => {
            process.exit(0);
          })

      })
      .catch((error) => {
        console.error(error);
      });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
