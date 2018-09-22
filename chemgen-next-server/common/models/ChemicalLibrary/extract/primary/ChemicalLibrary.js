"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var Promise = require("bluebird");
var ChemicalLibrary = app.models.ChemicalLibrary;
//TODO Change this get plateplan
ChemicalLibrary.extract.primary.getParentLibrary = function (workflowData, barcode) {
    return new Promise(function (resolve, reject) {
        ChemicalLibrary.extract.primary.getLibraryInfo(workflowData, barcode)
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.warn(error);
            reject(new Error(error));
        });
    });
};
/**
 * Get the vendor/parent library data for a particular screen
 * In the secondary screen genes are cherry picked, and can come from any location
 * In the chemical screens there is a 1-1 map between stock plates and library plates
 * In the RNAi they are rearrayed and get weird
 * @param workflowData
 * @param {string} barcode
 */
ChemicalLibrary.extract.primary.getLibraryInfo = function (workflowData, barcode) {
    var where;
    try {
        where = {
            plate: workflowData.search.library.chemical[workflowData.librarycode].plate,
            libraryId: workflowData.libraryId,
        };
    }
    catch (error) {
        app.winston.error("Error extracting library info from workflowData " + error);
        throw (new Error(error));
    }
    return new Promise(function (resolve, reject) {
        ChemicalLibrary.find({
            where: where,
            limit: 1000,
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ChemicalLibrary.js.map