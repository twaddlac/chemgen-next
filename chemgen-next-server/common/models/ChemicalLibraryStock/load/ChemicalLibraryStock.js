"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var ChemicalLibraryStock = app.models['ChemicalLibraryStock'];
//TODO This should not be created here - but after we create the expAssay
ChemicalLibraryStock.load.createStocks = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlateData.wellDataList, function (wellData) {
            wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
            var createObj = wellData.stockLibraryData;
            return app.models.ChemicalLibraryStock
                .findOrCreate({
                where: app.etlWorkflow.helpers.findOrCreateObj(createObj),
            }, createObj)
                .then(function (results) {
                wellData.stockLibraryData = results[0];
                return wellData;
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ChemicalLibraryStock.js.map