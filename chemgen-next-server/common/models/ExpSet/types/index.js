"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var ExpSetSearch = /** @class */ (function () {
    function ExpSetSearch(data) {
        this.pageSize = 20;
        this.ctrlLimit = 4;
        this.includeCounts = true;
        this.includeAlbums = true;
        this.includeManualScores = false;
        this.filterManualScores = false;
        this.cleanUp = false;
        data.includeCounts = true;
        data.includeAlbums = true;
        //Allow for searching either using pagination or skip
        if (lodash_1.isUndefined(data.skip) || lodash_1.isNull(data.skip)) {
            data.skip = 0;
        }
        if (lodash_1.isUndefined(data.currentPage) || lodash_1.isNull(data.currentPage)) {
            data.currentPage = 1;
        }
        else {
            data.skip = data.pageSize * data.currentPage;
        }
        // If these aren't already an array, make them an array
        ['arraySearch', 'rnaiSearch', 'chemicalSearch', 'librarySearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map(function (searchKey) {
            if (lodash_1.isUndefined(data[searchKey]) || lodash_1.isNull(data[searchKey] || !data[searchKey])) {
                data[searchKey] = [];
            }
            else if (!lodash_1.isArray(data[searchKey])) {
                data[searchKey] = [data[searchKey]];
            }
        });
        Object.assign(this, data);
    }
    return ExpSetSearch;
}());
exports.ExpSetSearch = ExpSetSearch;
var ExpSetSearchResults = /** @class */ (function () {
    function ExpSetSearchResults(data) {
        this.rnaisList = [];
        this.rnaisXrefs = [];
        this.compoundsList = [];
        this.expAssays = [];
        this.expAssay2reagents = [];
        this.modelPredictedCounts = [];
        this.expPlates = [];
        this.expScreens = [];
        this.expWorkflows = [];
        this.expManualScores = [];
        this.currentPage = 1;
        this.skip = 0;
        this.totalPages = 0;
        this.pageSize = 20;
        this.albums = [];
        this.expGroupTypeAlbums = [];
        this.fetchedFromCache = false;
        Object.assign(this, data);
    }
    return ExpSetSearchResults;
}());
exports.ExpSetSearchResults = ExpSetSearchResults;
var ExpSetSearchByCounts = /** @class */ (function () {
    function ExpSetSearchByCounts(data) {
        this.pageSize = 20;
        this.ctrlLimit = 4;
        this.includeCounts = true;
        this.includeAlbums = true;
        this.includeManualScores = false;
        this.filterManualScores = false;
        this.order = 'DESC';
        if (!lodash_1.isObject(data)) {
            data = {};
        }
        data.includeCounts = true;
        data.includeAlbums = true;
        //Allow for searching either using pagination or skip
        if (lodash_1.isUndefined(data.skip) || lodash_1.isNull(data.skip)) {
            data.skip = 0;
        }
        if (lodash_1.isUndefined(data.currentPage) || lodash_1.isNull(data.currentPage)) {
            data.currentPage = 1;
        }
        else {
            data.skip = data.pageSize * data.currentPage;
        }
        // If these aren't already an array, make them an array
        ['arraySearch', 'modelSearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map(function (searchKey) {
            if (lodash_1.isUndefined(data[searchKey]) || lodash_1.isNull(data[searchKey] || !data[searchKey])) {
                data[searchKey] = [];
            }
            else if (!lodash_1.isArray(data[searchKey])) {
                data[searchKey] = [data[searchKey]];
            }
        });
        Object.assign(this, data);
    }
    return ExpSetSearchByCounts;
}());
exports.ExpSetSearchByCounts = ExpSetSearchByCounts;
//# sourceMappingURL=index.js.map