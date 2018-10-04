"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var models_1 = require("../../../types/sdk/models");
var lodash_1 = require("lodash");
var ExpAssay2reagent = app.models['ExpAssay2reagent'];
ExpAssay2reagent.load.createAssayStock = function (workflowData, expPlateData) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
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
/**
 * Once the expDesign table is populated we can go back and update the ExpAssay2reagent record with the treatmentGroupId
 * Which is one of many cheap lookup values
 * @param workflowData
 * @param screenData
 */
ExpAssay2reagent.load.workflows.updateTreatmentGroupId = function (workflowData, screenData) {
    return new Promise(function (resolve, reject) {
        var data = {};
        data.expAssay2reagents = [];
        data.expAssays = [];
        screenData.plateDataList.map(function (plateData) {
            plateData.wellDataList.map(function (wellData) {
                if (wellData.expAssay2reagent.expGroupId) {
                    data.expAssay2reagents.push(wellData.expAssay2reagent);
                }
                if (wellData.expAssay.expGroupId) {
                    data.expAssays.push(wellData.expAssay);
                }
            });
        });
        lodash_1.remove(data.expAssay2reagents, { reagentType: 'ctrl_null' });
        lodash_1.remove(data.expAssay2reagents, { reagentType: 'ctrl_strain' });
        ExpAssay2reagent.load.filterExpAssay2reagent(data['expAssays'], data['expAssay2reagents'], screenData)
            .then(function () {
            app.winston.info("Complete updating ExpAssay2reagents");
            resolve();
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
ExpAssay2reagent.load.filterExpAssay2reagent = function (expAssays, expAssay2reagentsAll, screenData) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        Promise.map(expAssays, function (expAssay) {
            var expAssay2reagents = lodash_1.filter(expAssay2reagentsAll, function (expAssay2reagent) {
                return lodash_1.isEqual(Number(expAssay.assayId), Number(expAssay2reagent.assayId));
            });
            return ExpAssay2reagent.load.updateExpAssay2reagent(expAssay, expAssay2reagents, screenData);
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
};
ExpAssay2reagent.load.updateExpAssay2reagent = function (expAssay, expAssay2reagents, screenData) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        Promise.map(expAssay2reagents, function (expAssay2reagent) {
            expAssay2reagent.expGroupId = expAssay.expGroupId;
            expAssay2reagent.expWorkflowId = expAssay.expWorkflowId;
            if (expAssay.expGroupId) {
                return app.models.ExpDesign.extract.workflows
                    .getExpSetByExpGroupId(expAssay.expGroupId, screenData.expDesignList)
                    .then(function (results) {
                    if (!lodash_1.isEqual(expAssay2reagent.reagentType, 'ctrl_null') && !lodash_1.isEqual(expAssay2reagent.reagentType, 'ctrl_strain')) {
                        if (lodash_1.isArray(results) && results.length) {
                            expAssay2reagent.treatmentGroupId = results[0].treatmentGroupId;
                        }
                    }
                    return app.models.ExpAssay2reagent.upsert(expAssay2reagent);
                })
                    .then(function () {
                    return;
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    reject(new Error(error));
                });
            }
            else {
                return app.models.ExpAssay2reagent
                    .upsert(expAssay2reagent)
                    .then(function (results) {
                    return;
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    reject(new Error(error));
                });
            }
        }, { concurrency: 1 })
            .then(function () {
            resolve();
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpAssay2reagent.js.map