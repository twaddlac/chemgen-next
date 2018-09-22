"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var models_1 = require("../../../types/sdk/models");
var ExpAssay2reagent = app.models['ExpAssay2reagent'];
ExpAssay2reagent.load.createAssayStock = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        Promise.map(expPlateData.wellDataList, function (wellData) {
            wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
            var createObj = new models_1.ExpAssay2reagentResultSet({
                assayId: wellData.expAssay.assayId,
                expGroupId: wellData.expAssay.expGroupId,
                plateId: expPlateData.expPlate.plateId,
                screenId: workflowData.screenId,
                stockId: wellData.stockLibraryData.stockId,
                libraryId: workflowData.libraryId,
                reagentId: wellData.stockLibraryData[workflowData.reagentLookUp],
                parentLibraryPlate: wellData.parentLibraryData.plate,
                parentLibraryWell: wellData.parentLibraryData.well,
                stockLibraryWell: wellData.expAssay.assayWell,
                reagentName: wellData.annotationData.taxTerm,
                reagentTable: workflowData.libraryStockModel,
                reagentType: wellData.expGroup.expGroupType,
                expWorkflowId: wellData.expAssay.expWorkflowId,
            });
            return app.models.ExpAssay2reagent
                .findOrCreate({
                where: app.etlWorkflow.helpers.findOrCreateObj(createObj),
            }, createObj)
                .then(function (results) {
                wellData.expAssay2reagent = results[0];
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
//# sourceMappingURL=ExpAssay2reagent.js.map