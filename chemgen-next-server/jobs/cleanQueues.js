"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jobQs = require("./defineQueues");
var redis = require("redis");
var config = require("config");
var redisClient = redis.createClient(config.get('redisUrl'));
redisClient.flushdb(function (err, succeeded) {
    console.log("Success flushdb: " + succeeded);
    if (err) {
        console.log("Error: " + err);
    }
});
redisClient.flushall(function (err, succeeded) {
    console.log("Success flushall: " + succeeded);
    if (err) {
        console.log("Error: " + err);
    }
});
Object.keys(jobQs).map(function (queue) {
    console.log(queue);
    //@ts-ignore
    jobQs[queue].clean(0, 'delayed');
    //@ts-ignore
    jobQs[queue].clean(0, 'active');
    //@ts-ignore
    jobQs[queue].clean(0, 'completed');
    //@ts-ignore
    jobQs[queue].clean(0, 'failed');
    //@ts-ignore
    jobQs[queue].empty()
        .then(function () {
        console.log("Cleaned the queues!");
    })
        .catch(function (error) {
        console.log("Error: " + error);
    });
});
//# sourceMappingURL=cleanQueues.js.map