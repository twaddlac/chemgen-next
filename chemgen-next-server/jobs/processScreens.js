#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../server/server");
var jobQueues = require("./defineQueues");
var Promise = require("bluebird");
app.models.ExpScreenUploadWorkflow
    .find({
    where: {
        name: /CHEM/,
    },
    limit: 5
})
    .then(function (results) {
    results.map(function (workflow) {
        app.winston.info("Queuing: " + workflow.name);
        workflow.screenName = "Pristionchus pacificus + N2 Primary Chembridge Whole Library Screen";
        workflow.screenId = 9;
    });
    // @ts-ignore
    return Promise.map(results, function (workflow) {
        return app.models.ExpScreenUploadWorkflow.upsert(workflow);
    })
        .then(function (results) {
        //@ts-ignore
        Promise.map(results, function (result) {
            jobQueues.workflowQueue.add({ workflowData: result });
        })
            .then(function () {
            process.exit(0);
        });
    })
        .catch(function (error) {
        console.error(error);
    });
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
//# sourceMappingURL=processScreens.js.map