import app  = require('../../../../server/server.js');
import Promise = require('bluebird');
import { ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData: ExpScreenUploadWorkflowResultSet | ExpScreenUploadWorkflowResultSet[]) {
  console.log('Starting work');
  return new Promise((resolve, reject) => {
    if (workflowData instanceof Array) {
      Promise.map(workflowData, (data: ExpScreenUploadWorkflowResultSet) => {
        let biosampleType = `${data.biosampleType}s`;
        return ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(data);
      })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
    else {
      let biosampleType = `${workflowData.biosampleType}s`;
      ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(workflowData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
    }
  });
};

