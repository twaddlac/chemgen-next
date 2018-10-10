"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
//@ts-ignore
var ExpSet = app.models.ExpSet;
/**
 * This only builds the most basic pagination
 * It does not do any filtering for assays that already have scores
 * Or ordering expAssays by any rank
 * To do eithe of these things see ExpSet.extract.workflows.scoring
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildBasicPaginationData = function (data, search) {
    return new Promise(function (resolve, reject) {
        var or = app.models.ExpSet.extract.buildQuery(data, search);
        app.paginateModel('ExpAssay2reagent', { or: or }, search.pageSize)
            .then(function (pagination) {
            data.currentPage = search.currentPage;
            data.skip = search.skip;
            data.pageSize = search.pageSize;
            data.totalPages = pagination.totalPages;
            resolve(data);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpSetExtractPagination.js.map