"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var types_1 = require("../../types");
var client = require("knex");
var knex = client({
    client: 'mysql',
    connection: {
        host: process.env.CHEMGEN_HOST,
        user: process.env.CHEMGEN_USER,
        password: process.env.CHEMGEN_PASS,
        database: process.env.CHEMGEN_DB,
    },
    debug: true,
});
var ExpSet = app.models.ExpSet;
/**
 * Grab ExpSets that do not have a manual score and organize by plate
 * This one is a little different from the other ExpSet function, which assume that the user wants to see all the replicates together
 * Instead the user independently scores each plate
 * So we can just use the expWorkflowId to do all the lookups
 * This is not same as the others - where we may be searching for a gene/chemical across all the screens
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByPlate = function (search) {
    return new Promise(function (resolve, reject) {
        console.log("Before: " + JSON.stringify(search));
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({});
        console.log("After: " + JSON.stringify(search));
        var sqlQuery = ExpSet.extract.buildNativeQuery(data, search, false);
        sqlQuery = sqlQuery.count();
        data.pageSize = 1;
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            //Get the plate - and then get all plates in that expSet
            // return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, false);
            return ExpSet.extract.getExpAssay2reagentsByExpWorkflowId(data, search);
        })
            .then(function (data) {
            return app.models.ExpSet.extract.buildExpSets(data, search);
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.getExpAssay2reagentsByExpWorkflowId = function (data, search) {
    return new Promise(function (resolve, reject) {
        app.models.ExpAssay2reagent
            .find({
            where: {
                and: [{ expWorkflowId: data.expAssay2reagents[0].expWorkflowId },
                    { reagentId: { neq: null } },
                ]
            }
        })
            .then(function (expAssay2reagents) {
            var groups = lodash_1.groupBy(expAssay2reagents, 'reagent_type');
            ['ctrl_null', 'ctrl_strain'].map(function (expGroupType) {
                groups[expGroupType] = lodash_1.shuffle(groups[expGroupType]);
                groups[expGroupType] = groups[expGroupType].slice(0, search.ctrlLimit);
            });
            Object.keys(groups).map(function (expGroupType) {
                groups[expGroupType].map(function (expAssay2reagent) {
                    data.expAssay2reagents.push(expAssay2reagent);
                });
            });
            return data;
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpSetScoringExtractByPlate.js.map