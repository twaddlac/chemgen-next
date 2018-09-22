"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ChemicalLibrary = app.models.ChemicalLibrary;
//TODO There is a LOT of redundancy between this and the RNAi screens
//TODO Change this get plateplan
ChemicalLibrary.extract.secondary.getParentLibrary = function (workflowData, barcode) {
    return new Promise(function (resolve, reject) {
        ChemicalLibrary.extract.secondary.getLibraryInfo(workflowData, barcode)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * TODO Each well is an array of values!!
 * Each well can incorporate more than 1 rnai/chemical in it
 * In the secondary screen genes are cherry picked, and can come from any location
 * They are generated in the interface, during the getPlatePlan
 * @param workflowData
 * @param {string} barcode
 */
ChemicalLibrary.extract.secondary.getLibraryInfo = function (workflowData, barcode) {
    return new Promise(function (resolve, reject) {
        if (!lodash_1.get(workflowData, 'platePlanId')) {
            reject(new Error('Secondary screens must have a platePlan!'));
        }
        else {
            if (lodash_1.isEmpty(workflowData.platePlan) || lodash_1.isNull(workflowData.platePlan)) {
                reject(new Error('Not able to find a valid platePlan'));
            }
            else {
                // workflowData.platePlan = platePlan;
                //TODO Add hook for multiple library entries per well
                var wells = initialize96Wells();
                var libraryInfoList_1 = [];
                wells.map(function (well) {
                    if (!lodash_1.get(workflowData.platePlan, [well, 'lookUp'])) {
                        return;
                    }
                    else if (lodash_1.isEqual(workflowData.platePlan[well].lookUp, 'empty')) {
                        return;
                    }
                    else if (lodash_1.isEqual(workflowData.platePlan[well].lookUp, 'DMSO')) {
                        var libraryInfo = {};
                        libraryInfo.well = well;
                        libraryInfo.compoundSystematicName = 'DMSO';
                        libraryInfo.taxTerm = 'DMSO';
                        libraryInfoList_1.push(libraryInfo);
                    }
                    else {
                        var libraryInfo = lodash_1.get(workflowData.platePlan, [well, 'parentLibrary']);
                        if (libraryInfo) {
                            // This is a hack
                            // In the processing step it looks for the library result based on the well
                            // So it gets changed here
                            // In the primary screen there is a 1:1 mapping of well : well
                            libraryInfo.origWell = libraryInfo.well;
                            libraryInfo.well = well;
                            libraryInfoList_1.push(libraryInfo);
                        }
                    }
                });
                resolve(libraryInfoList_1);
            }
        }
    });
};
function getPlatePlanWell(wellData, well, libraryInfoList) {
    if (!lodash_1.get(wellData, ['lookUp'])) {
        return;
    }
    else if (lodash_1.isEqual(wellData.lookUp, 'empty')) {
        return;
    }
    else if (lodash_1.isEqual(wellData.lookUp, 'DMSO')) {
        var libraryInfo = {};
        libraryInfo.well = well;
        libraryInfo.compoundSystematicName = 'DMSO';
        libraryInfo.taxTerm = 'DMSO';
        libraryInfoList.push(libraryInfo);
    }
    else {
        var libraryInfo = lodash_1.get(wellData, ['parentLibrary']);
        if (libraryInfo) {
            // This is a hack
            // In the processing step it looks for the library result based on the well
            // So it gets changed here
            // In the primary screen there is a 1:1 mapping of well : well
            libraryInfo.origWell = libraryInfo.well;
            libraryInfo.well = well;
            libraryInfoList.push(libraryInfo);
        }
    }
    return libraryInfoList;
}
function initialize96Wells() {
    var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var columns = [];
    var wells = [];
    for (var i = 1; i <= 12; i++) {
        var column = lodash_1.padStart(String(i), 2, '0');
        columns.push(column);
    }
    rows.forEach(function (row) {
        columns.forEach(function (column) {
            var well = "" + row + column;
            wells.push(well);
        });
    });
    return wells;
}
//# sourceMappingURL=ChemicalLibrary.js.map