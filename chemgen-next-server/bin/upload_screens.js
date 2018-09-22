#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require('commander');
var app = require('../server/server');
var Promise = require('bluebird');
var jsonfile = require('jsonfile');
var lodash_1 = require("lodash");
var path = require('path');
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
program
    .version('0.1.0')
    .option('-w, --workflow [value]', 'Workflow file is JSON format. File should be a single workflow or an array of workflows')
    .parse(process.argv);
var workflow = path.resolve(process.cwd(), program.workflow);
console.log('Beginning workflow upload...');
console.log("Found workflow " + workflow);
var workflowData;
try {
    workflowData = jsonfile.readFileSync(workflow);
}
catch (error) {
    console.log("Could not read file " + workflow);
    process.exit(1);
}
app.agenda.on('ready', function () {
    console.log('agenda ready!');
    // app.agenda.start();
    try {
        console.log('subbmitting....');
        app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: workflowData });
        // process.exit(0);
    }
    catch (error) {
        console.log("Received error: " + error);
        process.exit(1);
    }
    if (lodash_1.isArray(workflowData)) {
        workflowData.map(function (workflow) {
            app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: workflow });
        });
    }
    else {
        app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: workflowData });
    }
});
//# sourceMappingURL=upload_screens.js.map