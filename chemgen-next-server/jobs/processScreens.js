#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require("../server/server");
var jobQueues = require("./defineQueues");
var Promise = require("bluebird");
program
    .version('0.1.0')
    .option('-l, --limit [value]', 'Max number of workflows to process [1]', 1)
    .option('-s, --site [value]', 'Site - AD, NY, DEV [DEV]', 'DEV')
    .option('-p --search-pattern [value]', 'Search pattern - CHEM, AHR, RNAi, etc')
    .parse(process.argv);
processWorkflows(program);
function processWorkflows(program) {
    var search = {};
    if (program.searchPattern) {
        search = {
            name: new RegExp(program.searchPattern),
        };
    }
    app.models.ExpScreenUploadWorkflow
        .find({
        where: search,
        limit: program.limit
    })
        .then(function (results) {
        //@ts-ignore
        return Promise.map(results, function (result) {
            app.winston.info("Queueing: " + result.name + ".");
            jobQueues.workflowQueue.add({ workflowData: result });
        })
            .then(function () {
            app.winston.info('Completed queueing.');
            // process.exit(0);
        })
            .catch(function (error) {
            console.error(error);
        });
    })
        .catch(function (error) {
        console.log(error);
        process.exit(1);
    });
}
//# sourceMappingURL=processScreens.js.map