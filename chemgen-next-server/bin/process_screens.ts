#!/usr/bin/env node

import {ExpScreenUploadWorkflowResultSet} from "../common/types/sdk/models";

const app = require('../server/server');
import {WorkflowModel} from "../common/models";
import Promise = require('bluebird');
import {shuffle, range, slice} from 'lodash';

const jsonfile = require('jsonfile');
const path = require('path');
const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

// .find({where: {name: {like: '2018%'}}})
// let file = path.resolve(path.cwd, 'bin/migrate/worms/chemical/data/primary/chembridge_all.json');
let file = '/Users/jillian/Dropbox/projects/NY/chemgen/chemgen-next/bin/migrate/worms/chemical/data/primary/chembridge_all_grouped.json';
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

let name = 'RNAi AHR2 2018-08 Restrictive Secondary 23.3 mel-28';
app.models.ExpScreenUploadWorkflow
  .find({
    // where: {name: /RNAi/},
    // where: {and: [{screenStage: 'primary'}, {name: name}]},
  })
  .then((results) => {
    // results = [results[2]];
    results = shuffle(results);
    console.log(`Results length ${results.length}`);
    results.map((result) => {
      console.log(`ScreenId: ${result.screenId} ScreenName: ${result.screenName} Name: ${result.name}`);
      app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: result});
    });
    // process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });

