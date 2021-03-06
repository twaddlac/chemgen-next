#!/usr/bin/env node
"use strict";
var Queue = require("bull");
var app = require("../server/server");
var Promise = require("bluebird");
var config = require("config");
var path = require("path");
var jobQueues = {
    testQueue: new Queue('test queue', config.get('redisUrl')),
    workflowQueue: new Queue('Exp Workflow Queue: Process Exp Workflows in the DB', {
        redis: {
            port: config.get('redisPort'),
            host: config.get('redisHost')
        },
    }),
    testConcurrencyQueue: new Queue('test limit queue', {
        redis: {
            port: config.get('redisPort'),
            host: config.get('redisHost')
        },
        limiter: {
            max: 1,
            duration: 10000,
        }
    })
};
jobQueues.testConcurrencyQueue.process(function (job) {
    return new Promise(function (resolve, reject) {
        console.log("DateTime: " + new Date(Date.now()));
        console.log(JSON.stringify(job.data));
        resolve();
    });
});
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => {
//   jobQueues.testConcurrencyQueue.add({hello: 'world! redis queue is working', step: index});
// });
jobQueues.workflowQueue.process(1, path.resolve(__dirname, 'workflowQueue.js'));
jobQueues.workflowQueue.on('completed', function (job, result) {
    console.log("Job completed " + new Date(Date.now()) + " " + job.id + " " + result);
});
app.jobQueues = jobQueues;
module.exports = jobQueues;
//# sourceMappingURL=defineQueues.js.map