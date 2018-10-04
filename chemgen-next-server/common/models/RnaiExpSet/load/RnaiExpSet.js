"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var types_1 = require("../../ExpSet/types");
var RnaiExpSet = app.models.RnaiExpSet;
/**
 * Here be a few convenience methods to query for query RNAi sets
 * Most of the actual work is done over at app.models.ExpSet
 */
/**
 * Get ExpSets by GeneList
 * GeneList is an array of strings, with either the wormbase name of the cosmid name
 * Optionally, this also allows for searching by libraryId, screen, plate, expWorkflowId
 * If search.includeCounts == True, this will also fetch the includeCounts
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSetsByGeneList = function (search) {
    return new Promise(function (resolve, reject) {
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({});
        app.models.RnaiLibrary.extract.workflows
            .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
            .then(function (results) {
            if (lodash_1.isEmpty(results)) {
                resolve(data);
            }
            else {
                data.rnaisList = results;
                app.models.ExpSet.extract.buildBasicPaginationData(data, search)
                    .then(function (data) {
                    return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
                })
                    .then(function (results) {
                    return app.models.ExpSet.extract.workflows.getReagentData(results, search);
                })
                    .then(function (results) {
                    resolve(results);
                })
                    .catch(function (error) {
                    reject(new Error(error));
                });
            }
        });
    });
};
/**
 * This function does not include searching for genes, only experimental data
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSets = function (search) {
    return new Promise(function (resolve, reject) {
        search = new types_1.ExpSetSearch(search);
        var data = new types_1.ExpSetSearchResults({ rnaisList: [] });
        app.models.ExpSet.extract.buildBasicPaginationData(data, search)
            .then(function (data) {
            return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
        })
            .then(function (searchResults) {
            var where = {
                where: {
                    rnaiId: {
                        inq: searchResults.expAssay2reagents.map(function (expAssay2reagent) {
                            return expAssay2reagent.reagentId;
                        }),
                    },
                }
            };
            return app.models.RnaiLibrary
                .find(where)
                .then(function (rnaiResults) {
                searchResults.rnaisList = rnaiResults;
                // return searchResults;
                // TODO - need to write a new function for getting xrefs from RnaiLibraryResults
                // Now if an xref is not found it returns an empty result, and ignores the RnaiLibrayr Result, which is no GOOD
                // return app.models.RnaiLibrary.extract.workflows.getRnaiLibraryFromUserGeneList(rnaisList, search)
                return app.models.ExpSet.extract.workflows.getReagentData(searchResults, search);
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function (searchResults) {
            app.winston.info('resolving here!');
            resolve(searchResults);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=RnaiExpSet.js.map