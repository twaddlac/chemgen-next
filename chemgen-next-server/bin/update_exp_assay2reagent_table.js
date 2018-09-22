#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var path = require('path');
var fs = require('fs');
var search = {
    expWorkflowId: null
};
/**
 * Decided to add the expGroupId/expGroupId to the expAssay2reagent table
 * This script just pulls the expGroupId from the expAssay table,
 * and updates the corresponding expAssay2reagent table with the correct expGroupId
 */
countExpAssays()
    .then(function (paginationResults) {
    return getPagedExpAssays(paginationResults);
})
    .then(function () {
    console.log('finished!');
    process.exit(0);
})
    .catch(function (error) {
    console.log(error);
    process.exit(1);
});
function getPagedExpAssays(paginationResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(paginationResults.pages, function (page) {
            var skip = Number(page) * Number(paginationResults.limit);
            console.log("Page: " + page + " Skip: " + skip);
            var data = {};
            return app.models.ExpAssay2reagent
                .find({
                limit: paginationResults.limit,
                skip: skip,
                where: search,
            })
                .then(function (results) {
                data['expAssay2reagents'] = results;
                // console.log(`Results Len : ${results.length}`);
                // console.log(JSON.stringify(results, null, 2));
                var or = results.map(function (row) {
                    return { assayId: row.assayId };
                });
                return app.models.ExpAssay
                    .find({
                    where: { or: or },
                });
            }, { concurrency: 1 })
                .then(function (results) {
                console.log('Found some expAssays');
                data['expAssays'] = results;
                return getExpAssay2reagent(results, data['expAssay2reagents']);
            })
                .then(function () {
                return;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
// TODO - should do this the other way around - get all the ExpAssay2reagent where they expGroupId is null FIRST
function getExpAssay2reagent(expAssays, expAssay2reagentsAll) {
    console.log('In getExpAssay2reagent');
    // console.log(JSON.stringify(expAssay2reagentsAll[0], null, 2));
    return new Promise(function (resolve, reject) {
        Promise.map(expAssays, function (expAssay) {
            // console.log(JSON.stringify(expAssay));
            var expAssay2reagents = lodash_1.filter(expAssay2reagentsAll, function (expAssay2reagent) {
                return lodash_1.isEqual(Number(expAssay.assayId), Number(expAssay2reagent.assayId));
            });
            return updateExpAssay2reagent(expAssay, expAssay2reagents)
                .then(function (rows) {
                return;
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
function updateExpAssay2reagent(expAssay, expAssay2reagents) {
    return new Promise(function (resolve, reject) {
        Promise.map(expAssay2reagents, function (expAssay2reagent) {
            expAssay2reagent.expGroupId = expAssay.expGroupId;
            expAssay2reagent.expWorkflowId = expAssay.expWorkflowId;
            if (expAssay.expGroupId) {
                console.log("There is an expGroup " + expAssay.expGroupId);
                return app.models.ExpDesign.extract.workflows
                    .getExpSets([{ expGroupId: expAssay.expGroupId }])
                    .then(function (results) {
                    if (!lodash_1.isEqual(expAssay2reagent.reagentType, 'ctrl_null') && !lodash_1.isEqual(expAssay2reagent.reagentType, 'ctrl_strain')) {
                        expAssay2reagent.treatmentGroupId = results.expDesigns[0][0].treatmentGroupId;
                    }
                    return app.models.ExpAssay2reagent.upsert(expAssay2reagent);
                })
                    .then(function (results) {
                    console.log(JSON.stringify(results));
                    return;
                })
                    .catch(function (error) {
                    console.log(error);
                    reject(new Error(error));
                });
            }
            else {
                console.log('There is NO exp Group....');
                return app.models.ExpAssay2reagent
                    .upsert(expAssay2reagent)
                    .then(function (results) {
                    console.log(JSON.stringify(results));
                    return;
                })
                    .catch(function (error) {
                    console.log(error);
                    reject(new Error(error));
                });
            }
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
function countExpAssays() {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay2reagent
            .count(search)
            .then(function (count) {
            var limit = 50;
            var numPages = Math.round(count / limit);
            var pages = lodash_1.range(0, numPages + 2);
            pages = lodash_1.shuffle(pages);
            console.log("count is " + count);
            resolve({ count: count, pages: pages, limit: limit });
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
}
//# sourceMappingURL=update_exp_assay2reagent_table.js.map