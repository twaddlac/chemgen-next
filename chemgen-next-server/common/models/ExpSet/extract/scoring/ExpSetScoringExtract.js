"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var decamelize = require("decamelize");
var config = require("config");
var knex = config.get('knex');
/**
 * ExpSetExtractScoring* are a list of apis to get ExpSets for scoring
 */
/**
 * The ExpSetExtractScoring* libraries require more complex sql functionality than given by loopback alone
 * (loopback does not support exists, min, max, nested sql, etc)
 * For this reason we use knex, to generate the sql, and then execute it with the loopback native sql executor
 */
var ExpSet = app.models.ExpSet;
/**
 * Grab ExpSets that do not have a manual score
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSets = function (search) {
    return new Promise(function (resolve, reject) {
        search = new ExpSetTypes_1.ExpSetSearch(search);
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        if (!search.scoresExist) {
            search.scoresExist = false;
        }
        var sqlQuery = ExpSet.extract.buildNativeQuery(data, search, search.scoresExist);
        sqlQuery = sqlQuery.count();
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, search.scoresExist);
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
ExpSet.extract.workflows.getExpAssay2reagentsByScores = function (data, search, scoresExist) {
    return new Promise(function (resolve, reject) {
        var sqlQuery = ExpSet.extract.buildNativeQuery(data, search, scoresExist);
        //Add Pagination
        //TODO Orderby RAND() May be making a big performance hit
        //A much faster way to do this would be to get all the expWorkflowIds that match the query
        //Then get the ones that haven't been scored
        sqlQuery = sqlQuery
            .orderByRaw('RAND()')
            .limit(data.pageSize)
            .offset(data.skip);
        var ds = app.datasources.chemgenDS;
        app.winston.info(JSON.stringify(sqlQuery.toString()));
        ds.connector.execute(sqlQuery.toString(), [], function (error, rows) {
            if (error) {
                app.winston.error(error);
                return reject(new Error(error));
            }
            else {
                var rowData = rows.map(function (rawRowData) {
                    Object.keys(rawRowData).map(function (rowKey) {
                        rawRowData[lodash_1.camelCase(rowKey)] = rawRowData[rowKey];
                        delete rawRowData[rowKey];
                    });
                    return new app.models.ExpAssay2reagent(JSON.parse(JSON.stringify(rawRowData)));
                });
                data.skip = data.skip + data.pageSize;
                data.expAssay2reagents = rowData;
                return resolve(data);
            }
        });
    });
};
ExpSet.extract.buildUnscoredPaginationData = function (data, search, sqlQuery) {
    return new Promise(function (resolve, reject) {
        var ds = app.datasources.chemgenDS;
        ds.connector.execute(sqlQuery, [], function (error, rows) {
            if (error) {
                reject(new Error(error));
            }
            else {
                var count = rows[0]["count(*)"];
                var totalPages = Math.round(lodash_1.divide(Number(count), Number(search.pageSize)));
                data.currentPage = search.currentPage;
                data.pageSize = search.pageSize;
                data.skip = search.skip;
                data.totalPages = totalPages;
                resolve(data);
            }
        });
    });
};
/**
 * The expPlates will have much fewer contactSheetResults, and so it will be faster to query, and more possible to pull a random plate for scoring
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQueryExpWorkflowId = function (data, search, hasManualScores) {
    var query = knex('exp_plate');
    ['screen', 'expWorkflow', 'plate'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    //Get if value exists in the manual score table
    if (hasManualScores) {
        query = query
            .whereExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_plate.exp_workflow_id = exp_manual_scores.exp_workflow_id');
        });
    }
    else {
        query = query
            .whereNotExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_plate.exp_workflow_id = exp_manual_scores.exp_workflow_id');
        });
    }
    return query;
};
/**
 * This query will find a single assay that hasn't been scored
 * CAUTION - A query will NOT show up here if the entire expSet was toggled instead of the assays individually
 * @param data
 * @param search
 * @param hasManualScores
 */
ExpSet.extract.buildNativeQuery = function (data, search, hasManualScores) {
    var query = knex('exp_assay2reagent');
    query = query
        .where('reagent_type', 'LIKE', 'treat%')
        .whereNot({ reagent_id: null });
    //Add Base experiment lookup
    ['screen', 'library', 'expWorkflow', 'plate', 'expGroup', 'assay'].map(function (searchType) {
        if (!lodash_1.isEmpty(search[searchType + "Search"])) {
            var sql_col = decamelize(searchType + "Id");
            var sql_values = search[searchType + "Search"];
            query = query.whereIn(sql_col, sql_values);
        }
    });
    //Add Rnai reagent Lookup
    if (!lodash_1.isEmpty(data.rnaisList)) {
        query = query
            .where(function () {
            var firstVal = data.rnaisList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.rnaiId, library_id: firstVal.libraryId });
            data.rnaisList.map(function (rnai) {
                firstWhere = firstWhere.orWhere({ reagent_id: rnai.rnaiId, library_id: firstVal.libraryId });
            });
        });
    }
    //Add Chemical Lookup
    if (!lodash_1.isEmpty(data.compoundsList)) {
        query = query
            .where(function () {
            var firstVal = data.compoundsList.shift();
            var firstWhere = this.orWhere({ 'reagent_id': firstVal.compoundId, library_id: firstVal.libraryId });
            data.compoundsList.map(function (compound) {
                firstWhere = firstWhere.orWhere({ reagent_id: compound.compoundId, library_id: firstVal.libraryId });
            });
        });
    }
    //Get if value exists in the manual score table
    if (hasManualScores) {
        query = query
            .whereExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
        });
    }
    else {
        query = query
            .whereNotExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_assay2reagent.assay_id = exp_manual_scores.assay_id');
        });
    }
    return query;
};
//# sourceMappingURL=ExpSetScoringExtract.js.map