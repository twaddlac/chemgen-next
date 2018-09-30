"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData) {
    console.log('Starting work');
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            Promise.map(workflowData, function (data) {
                var biosampleType = data.biosampleType + "s";
                return ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(data);
            })
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
        else {
            var biosampleType = workflowData.biosampleType + "s";
            ExpScreenUploadWorkflow.load.workflows[biosampleType].processWorkflow(workflowData)
                .then(function () {
                resolve();
            })
                .catch(function (error) {
                console.log(error);
                reject(new Error(error));
            });
        }
    });
};
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map