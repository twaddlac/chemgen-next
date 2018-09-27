#!/usr/bin/env node

import Queue = require('bull');
import app = require('../server/server');
import Promise = require('bluebird');
import config = require('config');

const jobQueues = {
  testQueue :new Queue('test queue', config.get('redisUrl')),
  workflowQueue : new Queue('Exp Workflow Queue: Process Exp Workflows in the DB', config.get('redisUrl')),
};

jobQueues.testQueue.process(function(job, done){
  console.log(JSON.stringify(job.data));
  done();
});
jobQueues.testQueue.add({hello: 'world! redis queue is working'});

jobQueues.workflowQueue.process(function(job){
  return new Promise((resolve, reject) =>{
    app.winston.info('Starting workflowQueue');
    return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.data.workflowData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
});

app.jobQueues = jobQueues;
export = jobQueues;

