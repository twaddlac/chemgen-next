"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var RnaiLibrary = app.models.RnaiLibrary;
//TODO Change this get plateplan
RnaiLibrary.extract.primary.getParentLibrary = function (workflowData, barcode) {
    return new Promise(function (resolve, reject) {
        RnaiLibrary.extract.primary.getLibraryInfo(workflowData, barcode)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
/**
 * Get the vendor/parent library data for a particular screen
 * In the primary screen 1 plate corresponds to 1 chrom-plate-quadrant location
 * In the secondary screen genes are cherry picked, and can come from any location
 * @param workflowData
 * @param {string} barcode
 */
RnaiLibrary.extract.primary.getLibraryInfo = function (workflowData, barcode) {
    var quadrant = RnaiLibrary.helpers.getQuad(barcode);
    var plate = RnaiLibrary.helpers.getPlate(workflowData.search.rnaiLibrary.plate);
    var chrom = workflowData.search.rnaiLibrary.chrom;
    var where = {
        stocktitle: chrom + '-' + plate + '--' + quadrant,
    };
    return new Promise(function (resolve, reject) {
        RnaiLibrary.find({
            where: where,
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=RnaiLibrary.js.map