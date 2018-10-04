"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var types_1 = require("../../types");
var decamelize = require("decamelize");
var config = require("config");
var knex = config.get('knex');
/**
 * ExpSetExtractScoring* are a list of apis to get ExpSets for scoring
 */
/**
 * ExpSetScoringExtractByCounts - extract various ExpSets, and order by counts
 * Possible order values are
 * percEmbLeth, percSter, broodSize, wormCount, larvaCount, eggCount
 */
var ExpSet = app.models.ExpSet;
/**
 * Grab ExpSets that do not have a manual score
 * @param {ExpSetSearch} search
 */
ExpSet.extract.workflows.getUnscoredExpSetsByCounts = function (search) {
    return new Promise(function (resolve, reject) {
        search = new types_1.ExpSetSearchByCounts(search);
        var data = new types_1.ExpSetSearchResults({});
        var sqlQuery = ExpSet.extract.buildNativeQueryCounts(data, search, false);
        sqlQuery = sqlQuery.count();
        ExpSet.extract.buildUnscoredPaginationData(data, search, sqlQuery.toString())
            .then(function (data) {
            return ExpSet.extract.workflows.getCountsByScores(data, search);
        })
            .then(function (data) {
            if (lodash_1.isEmpty(data.modelPredictedCounts)) {
                return data;
            }
            else {
                return app.models.ExpAssay2reagent
                    .find({
                    where: {
                        assayId: {
                            inq: data.modelPredictedCounts.map(function (modelPredictedCount) {
                                return modelPredictedCount.assayId;
                            })
                        }
                    }
                })
                    .then(function (expAssay2reagents) {
                    data.expAssay2reagents = expAssay2reagents;
                    return data;
                })
                    .then(function (data) {
                    return app.models.ExpSet.extract.buildExpSets(data, search);
                })
                    .catch(function (error) {
                    return new Error(error);
                });
            }
        })
            .then(function (data) {
            resolve(data);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpSet.extract.workflows.getCountsByScores = function (data, search, scoresExist) {
    return new Promise(function (resolve, reject) {
        var sqlQuery = ExpSet.extract.buildNativeQueryCounts(data, search, scoresExist);
        //Add Pagination
        if (search.orderBy) {
            sqlQuery = sqlQuery
                .orderByRaw(decamelize(search.orderBy) + " " + search.order);
        }
        sqlQuery = sqlQuery
            .limit(data.pageSize)
            .offset(data.skip);
        console.log("SqlQuery: " + sqlQuery.toString());
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
                    return new app.models.ModelPredictedCounts(JSON.parse(JSON.stringify(rawRowData)));
                });
                data.skip = data.skip + data.pageSize;
                data.modelPredictedCounts = rowData;
                return resolve(data);
            }
        });
    });
};
ExpSet.extract.buildNativeQueryCounts = function (data, search, hasManualScores) {
    var query = knex('model_predicted_counts');
    //Just get the treatment groups
    //The rest get pulled in during the build ExpSets
    query = query
        .where('exp_group_type', 'LIKE', 'treat%')
        .whereNot({ exp_group_id: null });
    //Add Base experiment lookup
    ['screen', 'model', 'expWorkflow', 'plate', 'expGroup', 'assay'].map(function (searchType) {
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
                .whereRaw('model_predicted_counts.treatment_group_id = exp_manual_scores.treatment_group_id');
        });
    }
    else {
        query = query
            .whereNotExists(function () {
            this.select(1)
                .from('exp_manual_scores')
                .whereRaw('model_predicted_counts.treatment_group_id = exp_manual_scores.treatment_group_id');
        });
    }
    return query;
};
//# sourceMappingURL=ExpSetScoringExtractByCounts.js.map