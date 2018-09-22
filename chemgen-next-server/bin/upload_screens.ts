#!/usr/bin/env node

const program = require('commander');
const app = require('../server/server');
const Promise = require('bluebird');
const jsonfile = require('jsonfile');
import {WorkflowModel} from "../common/models";
import {isArray} from 'lodash';

const path = require('path');

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

program
  .version('0.1.0')
  .option('-w, --workflow [value]', 'Workflow file is JSON format. File should be a single workflow or an array of workflows')
  .parse(process.argv);

let workflow = path.resolve(process.cwd(), program.workflow);
console.log('Beginning workflow upload...');
console.log(`Found workflow ${workflow}`);

let workflowData: any;
try {
  workflowData = jsonfile.readFileSync(workflow);
}
catch (error) {
  console.log(`Could not read file ${workflow}`);
  process.exit(1);
}

app.agenda.on('ready', function () {
  console.log('agenda ready!');
  // app.agenda.start();
  try {
    console.log('subbmitting....');
    app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData});
    // process.exit(0);
  } catch (error) {
    console.log(`Received error: ${error}`);
    process.exit(1);
  }
  if (isArray(workflowData)) {
    workflowData.map((workflow) =>{
      app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflow});
    });
  } else {
    app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData});
  }
});
