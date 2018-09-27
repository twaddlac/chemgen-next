#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
var jobQueues = require("./defineQueues");
var Promise = require("bluebird");
app.models.ExpScreenUploadWorkflow
    .find({
    where: {
        name: /CHEM Pr/,
    },
    limit: 10
})
    .then(function (results) {
    results.map(function (workflow) {
        workflow.screenName = "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen";
        workflow.screenId = 9;
    });
    // @ts-ignore
    return Promise.map(results, function (workflow) {
        return app.models.ExpScreenUploadWorkflow.upsert(workflow);
    })
        .then(function (results) {
        jobQueues.workflowQueue.add({ workflowData: results });
    })
        .catch(function (error) {
        // reject(new Error(error));
        console.error(error);
    });
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
//# sourceMappingURL=processScreens.js.map