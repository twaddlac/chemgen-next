"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var agenda = require("../agenda/agenda");
var cluster = require("cluster");
var instances = 2;
var numCPUs = require('os').cpus().length;
agenda.define('testJob', function (job) {
    console.log('There is a testJob ' + JSON.stringify(job.attr.data, null, 2));
});
agenda.on('start', function (job) {
    console.log('Job %s starting', job.attrs.name);
    console.log(JSON.stringify(job.attrs.data));
});
if (cluster.isMaster) {
    console.log("Master " + process.pid + " is running");
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log("worker " + worker.process.pid + " died");
    });
}
else {
    console.log("Worker " + process.pid + " started");
    startAgenda();
}
function startAgenda() {
    agenda.on('ready', function () {
        agenda.processEvery('2 seconds');
        agenda.start();
        agenda.now('testJob', {
            hello: 'world', thing1: function hello() {
            }
        });
        console.log('agenda started...');
    });
}
//# sourceMappingURL=run_agenda.js.map