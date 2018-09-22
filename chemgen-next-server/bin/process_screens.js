#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
var lodash_1 = require("lodash");
var jsonfile = require('jsonfile');
var path = require('path');
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
// .find({where: {name: {like: '2018%'}}})
// let file = path.resolve(path.cwd, 'bin/migrate/worms/chemical/data/primary/chembridge_all.json');
var file = '/Users/jillian/Dropbox/projects/NY/chemgen/chemgen-next/bin/migrate/worms/chemical/data/primary/chembridge_all_grouped.json';
// let chembridgeData: ExpScreenUploadWorkflowResultSet[] = jsonfile.readFileSync(file);
// chembridgeData = shuffle(chembridgeData);
// chembridgeData = slice(chembridgeData, 0, 1);
// chembridgeData = slice(chembridgeData, 0, 2);
// console.log('read in chembridgeData');
// app.agenda.on('ready', function () {
//   console.log('agenda is ready....');
//
//   chembridgeData.map((workflow: ExpScreenUploadWorkflowResultSet) => {
//     // console.log(JSON.stringify(workflow, null, 2));
//     workflow.screenName = "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen";
//     workflow.screenId = 9;
//     console.log(`ScreenId: ${workflow.screenId} ScreenName: ${workflow.screenName} Name: ${workflow.name}`);
//     app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflow});
//   });
//   process.exit(0);
// });
var name = 'RNAi AHR2 2018-08 Restrictive Secondary 23.3 mel-28';
app.models.ExpScreenUploadWorkflow
    .find({})
    .then(function (results) {
    // results = [results[2]];
    results = lodash_1.shuffle(results);
    console.log("Results length " + results.length);
    results.map(function (result) {
        console.log("ScreenId: " + result.screenId + " ScreenName: " + result.screenName + " Name: " + result.name);
        app.agenda.now('ExpScreenUploadWorkflow.doWork', { workflowData: result });
    });
    // process.exit(0);
})
    .catch(function (error) {
    process.exit(1);
});
//# sourceMappingURL=process_screens.js.map