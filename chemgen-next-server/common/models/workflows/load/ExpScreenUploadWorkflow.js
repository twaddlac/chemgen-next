"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
/* tslint:disable */
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
/* tslint:enable */
ExpScreenUploadWorkflow.load.workflows.doWork = function (workflowData) {
    return new Promise(function (resolve, reject) {
        if (workflowData instanceof Array) {
            Promise.map(workflowData, function (data) {
                var biosampleType = data.biosampleType + "s";
                app.winston.info("BioSampleType: " + biosampleType);
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