"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var wellData_1 = require("../../../types/custom/wellData");
var models_1 = require("../../../types/sdk/models");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var decamelize = require("decamelize");
var ChemicalLibrary = app.models['ChemicalLibrary'];
ChemicalLibrary.extract.parseLibraryResults = function (workflowData, expPlate, libraryResults) {
    return new Promise(function (resolve, reject) {
        var allWells = workflowData.wells;
        var barcode = expPlate.barcode;
        var plateId = expPlate.plateId;
        //TODO Move this to extract library
        //And then add it to the platePlan
        var platedbXrefSearch = [];
        allWells.map(function (well) {
            var libraryResult = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
            if (lodash_1.get(libraryResult, 'compoundLibraryId')) {
                var where = {
                    libraryId: workflowData.libraryId,
                    chemicalLibraryId: libraryResult.compoundLibraryId,
                };
                platedbXrefSearch.push(where);
            }
        });
        var taxTermRefs = ['compoundSystematicName', 'compoundMw', 'compoundFormula'];
        app.models.ChemicalXrefs.find({ where: { or: platedbXrefSearch } })
            .then(function (dbXrefs) {
            //@ts-ignore
            return Promise.map(allWells, function (well) {
                //TODO These should be library RESULTS
                var libraryResult = ChemicalLibrary.helpers.genLibraryResult(barcode, libraryResults, well);
                var where = {
                    libraryId: workflowData.libraryId,
                    chemicalLibraryId: libraryResult.compoundLibraryId,
                };
                //TODO Change this to OR so there aren't 80 million calls to the DB
                return app.models.ChemicalXrefs.extract.genTaxTerms(dbXrefs, where)
                    .then(function (chemicalTaxTerms) {
                    var taxTerms = [];
                    var isControl = false;
                    // For secondary plates we need to add an additional taxTerm for control wells
                    chemicalTaxTerms['taxTerms'].forEach(function (chemicalTaxTerm) {
                        taxTerms.push(chemicalTaxTerm);
                    });
                    // For the chembridge primary screens DMSOs are in 01 and 12
                    // TODO Add empty condition?
                    if (lodash_1.isEqual(workflowData.screenStage, 'primary')) {
                        if (well.match('01') || well.match('12')) {
                            taxTerms.push({
                                taxonomy: 'compound_systematic_name',
                                taxTerm: 'DMS0'
                            });
                            libraryResult.compoundSystematicName = 'DMSO';
                            isControl = true;
                            // libraryResult['compoundId'] = 'DMSO';
                        }
                    }
                    //Also get the formula, weight, and name from the libraryResult
                    taxTermRefs.map(function (taxTermRef) {
                        if (lodash_1.get(libraryResult, taxTermRef)) {
                            taxTerms.push({
                                taxonomy: decamelize(taxTermRef),
                                taxTerm: libraryResult[taxTermRef]
                            });
                        }
                    });
                    var taxTerm = '';
                    if (isControl) {
                        taxTerm = 'DMSO';
                    }
                    else {
                        taxTerm = String(libraryResult.compoundId);
                    }
                    // app.winston.info(libraryResult);
                    // app.winston.info('Creating the stock...');
                    var createStock = new models_1.ChemicalLibraryStockResultSet({
                        plateId: plateId,
                        libraryId: workflowData.libraryId,
                        compoundId: libraryResult.compoundId,
                        well: well,
                        location: '',
                        datePrepared: workflowData.stockPrepDate,
                        preparedBy: '',
                    });
                    return new wellData_1.WellCollection({
                        well: well,
                        stockLibraryData: createStock,
                        parentLibraryData: libraryResult,
                        annotationData: {
                            chemicalName: libraryResult.compoundSystematicName,
                            // taxTerm: String(libraryResult.compoundId),
                            taxTerm: taxTerm,
                            taxTerms: taxTerms,
                            dbXRefs: chemicalTaxTerms.xrefs,
                        }
                    });
                });
            });
        })
            .then(function (results) {
            // app.winston.info('returning contactSheetResults...');
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ChemicalLibrary.js.map