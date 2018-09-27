#!/usr/bin/env node
"use strict";
var Queue = require("bull");
var app = require("../server/server");
var Promise = require("bluebird");
var config = require("config");
var jobQueues = {
    testQueue: new Queue('test queue', config.get('redisUrl')),
    workflowQueue: new Queue('Exp Workflow Queue: Process Exp Workflows in the DB', config.get('redisUrl')),
};
jobQueues.testQueue.process(function (job, done) {
    console.log(JSON.stringify(job.data));
    done();
});
jobQueues.testQueue.add({ hello: 'world! redis queue is working' });
jobQueues.workflowQueue.process(function (job) {
    return new Promise(function (resolve, reject) {
        app.winston.info('Starting workflowQueue');
        return app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.data.workflowData)
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
});
app.jobQueues = jobQueues;
module.exports = jobQueues;
//# sourceMappingURL=defineQueues.js.map