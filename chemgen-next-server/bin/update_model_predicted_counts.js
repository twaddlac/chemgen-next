#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
numCPUs = 4;
var path = require('path');
var fs = require('fs');
var search = {
    or: [
        { expWorkflowId: null },
        { treatmentGroupId: null }
    ],
    and: [
        { expGroupType: { neq: 'ctrl_strain' } },
        { expGroupType: { neq: 'ctrl_null' } },
    ]
};
// countModelPredictedCounts()
//   .then((paginationResults) => {
//     return getPagedCounts(paginationResults)
//   })
//   .then(() => {
//     console.log('finished!');
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.log(error);
//     process.exit(1);
//   });
if (cluster.isMaster) {
    console.log("Master " + process.pid + " is running");
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log("worker " + worker.process.pid + " died");
    });
}
else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    console.log("Worker " + process.pid + " started");
    updateModelPredictedCounts()
        .then(function () {
        process.exit(0);
    })
        .catch(function (error) {
        console.log(error);
        process.exit(1);
    });
}
function updateModelPredictedCounts() {
    return new Promise(function (resolve, reject) {
        countModelPredictedCounts()
            .then(function (paginationResults) {
            var page = paginationResults.pages[0];
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            return app.models.ModelPredictedCounts
                .find({
                limit: paginationResults.limit,
                skip: skip,
                where: search
            });
        })
            .then(function (results) {
            return getExpAssays(results);
        })
            .then(function (results) {
            if (results) {
                return updateModelPredictedCounts()
                    .then(function () {
                    resolve();
                })
                    .catch(function (error) {
                    reject(new Error(error));
                });
            }
            else {
                resolve();
            }
        })
            .catch(function (error) {
            return new Error(error);
        });
    });
}
function getPagedCounts(paginationResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            return app.models.ModelPredictedCounts
                .find({
                limit: paginationResults.limit,
                skip: skip,
                where: search,
            })
                .then(function (results) {
                console.log("Results Len : " + results.length);
                // console.log(JSON.stringify(results));
                return getExpAssays(results);
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            app.winston.info('DONE');
            // console.log(JSON.stringify(paginationResults.count));
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getExpAssays(modelPredictedCounts) {
    return new Promise(function (resolve, reject) {
        if (lodash_1.isEmpty(modelPredictedCounts)) {
            resolve(false);
        }
        else {
            app.models.ExpAssay
                .find({
                where: {
                    assayId: {
                        inq: modelPredictedCounts.map(function (counts) {
                            return counts.assayId;
                        })
                    }
                }
            })
                .then(function (expAssays) {
                return Promise.map(modelPredictedCounts, function (modelPredictedCount) {
                    var expAssay = lodash_1.find(expAssays, function (expAssay) {
                        return lodash_1.isEqual(expAssay.assayId, modelPredictedCount.assayId);
                    });
                    return app.models.ExpGroup
                        .findOne({ where: { expGroupId: expAssay.expGroupId } })
                        .then(function (expGroup) {
                        // app.winston.info(`Old Counts: ${JSON.stringify(modelPredictedCount)}`);
                        modelPredictedCount.expWorkflowId = expAssay.expWorkflowId;
                        modelPredictedCount.expGroupId = expAssay.expGroupId;
                        modelPredictedCount.expGroupType = expGroup.expGroupType;
                        if (expAssay.expGroupId) {
                            return app.models.ExpDesign.extract.workflows
                                .getExpSets([{ expGroupId: expAssay.expGroupId }])
                                .then(function (results) {
                                modelPredictedCount.treatmentGroupId = results.expDesigns[0][0].treatmentGroupId;
                                // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                                return app.models.ModelPredictedCounts.upsert(modelPredictedCount);
                            })
                                .then(function (results) {
                                return;
                            })
                                .catch(function (error) {
                                app.winston.error(error);
                                reject(new Error(error));
                            });
                        }
                        else {
                            // app.winston.info(`New Counts: ${JSON.stringify(modelPredictedCount)}`);
                            return app.models.ModelPredictedCounts
                                .upsert(modelPredictedCount);
                        }
                    })
                        .catch(function (error) {
                        return new Error(error);
                    });
                });
            })
                .then(function (results) {
                // app.winston.info('got to final out');
                // results = flatten(results);
                resolve(true);
            })
                .catch(function (error) {
                reject(new Error(error));
            });
        }
    });
}
function countModelPredictedCounts() {
    return new Promise(function (resolve, reject) {
        app.models.ModelPredictedCounts
            .count(search)
            .then(function (count) {
            var limit = 1000;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            pages = lodash_1.shuffle(pages);
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=update_model_predicted_counts.js.map