#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var path = require('path');
var fs = require('fs');
countExpGroups()
    .then(function (paginationResults) {
    return getPagedExpGroups(paginationResults);
})
    .then(function () {
    console.log('finished!');
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getPagedExpGroups(paginationResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            return app.models.ExpGroup
                .find({
                limit: paginationResults.limit,
                skip: skip,
                where: {
                    expGroupType: {
                        like: 'ctrl%',
                    }
                }
            })
                .then(function (results) {
                console.log("Results Len : " + results.length);
                // console.log(JSON.stringify(contactSheetResults));
                return getExpDesign(results);
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            // console.log(JSON.stringify(paginationResults.count));
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function getExpDesign(expGroups) {
    console.log('In getExpDesign');
    return new Promise(function (resolve, reject) {
        Promise.map(expGroups, function (expGroup) {
            // console.log(JSON.stringify(expGroup));
            return app.models.ExpDesign
                .find({
                where: {
                    or: [
                        { treatmentGroupId: expGroup.expGroupId },
                        { controlGroupId: expGroup.expGroupId }
                    ]
                }
            })
                .then(function (expDesignRows) {
                return updateExpDesign(expGroup, expDesignRows);
            })
                .catch(function (error) {
                console.log(error);
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function updateExpDesign(expGroup, expDesigns) {
    return new Promise(function (resolve, reject) {
        Promise.map(expDesigns, function (expDesign) {
            if (lodash_1.isEqual(expDesign.controlGroupId, expGroup.expGroupId)) {
                expDesign.controlGroupReagentType = expGroup.expGroupType;
            }
            expDesign.expWorkflowId = expGroup.expWorkflowId;
            expDesign.screenId = expGroup.screenId;
            return app.models.ExpDesign
                .upsert(expDesign)
                .then(function (results) {
                console.log(JSON.stringify(expGroup));
                console.log(JSON.stringify(results));
                return;
            })
                .catch(function (error) {
                console.log(error);
                reject(new Error(error));
            });
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
function countExpGroups() {
    return new Promise(function (resolve, reject) {
        app.models.ExpGroup
            .count({
            and: [
                {
                    expGroupType: {
                        like: 'ctrl%',
                    }
                }
            ]
        })
            .then(function (count) {
            var limit = 100;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            pages = lodash_1.shuffle(pages);
            console.log("count is " + count);
            // pagination(1, count, 50);
            // console.log(`Pages: ${Math.round(count / 50)}`);
            // console.log(JSON.stringify(pages));
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=update_exp_design_table.js.map