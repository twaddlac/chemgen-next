"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var types_1 = require("../../types");
var decamelize = require("decamelize");
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
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({});
        var sqlQuery = ExpSet.extract.buildNativeQuery(data, search, false);
        sqlQuery = sqlQuery.count();
        app.winston.info("Search Obj: " + JSON.stringify(search));
        app.winston.info("Sql: " + sqlQuery.toString());
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            return ExpSet.extract.workflows.getExpAssay2reagentsByScores(data, search, false);
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
        sqlQuery = sqlQuery
            .orderBy('assay2reagent_id', 'asc')
            .limit(data.pageSize)
            .offset(data.skip);
        var ds = app.datasources.chemgenDS;
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
                .whereRaw('exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id');
        });
    }
    else {
        query = query
            .whereNotExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id');
        });
    }
    return query;
};
//# sourceMappingURL=ExpSetScoringExtract.js.map