#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var lodash_1 = require("lodash");
var Promise = require("bluebird");
var Papa = require("papaparse");
var models_1 = require("../../../../common/types/sdk/models");
var path = require('path');
var fs = require('fs');
var file = 'eegi-denorm-2012-01-18.csv';
// let file = 'eegi_ny_db_denorm_2012-01-18_A01.csv';
var eegi = path.resolve(__dirname, file);
var wormStrains = path.resolve(__dirname, 'worm_strain_table_ny.csv');
// Image urls look like this - http://eegi.bio.nyu.edu/image/32412/Tile000006.bmp
// eegi.bio.nyu.edu/${plateId}/tileMappingWell.bmp
parseCSVFile(eegi)
    .then(function (eegiResults) {
    var groupedResults = createExpGroups(eegiResults);
    return extractPlates(groupedResults)
        .then(function (platePlans) {
        console.log('finished');
        process.exit(0);
    })
        .catch(function (error) {
        console.log("Error: " + error);
        process.exit(1);
    });
})
    .catch(function (error) {
    console.log("Error: " + error);
    process.exit(1);
});
function parseCSVFile(csvFile) {
    return new Promise(function (resolve, reject) {
        Papa.parse(fs.createReadStream(csvFile), {
            header: true,
            complete: function (results) {
                resolve(results.data);
            },
        });
    });
}
/**
 * First create an arbitrary group from the experiment date, temperature and library_stock (minus the well),
 * From within that group create groupings of worm strains
 * From within that group groupings of plate IDs
 * @param eegiResults
 */
function createExpGroups(eegiResults) {
    eegiResults.map(function (eegiResult) {
        var libraryStock = eegiResult['experiment.library_stock_id'].replace(/_.*$/, '');
        var barcode = "RNAi--" + eegiResult['experimentplate.date'] + "--" + eegiResult['experimentplate.temperature'] + "--" + eegiResult['experiment.worm_strain_id'] + "--" + libraryStock + "--" + eegiResult["experiment.plate_id"];
        var name = "RNAi Ahringer " + eegiResult['experimentplate.date'] + " " + eegiResult['experimentplate.temperature'] + " " + eegiResult['experiment.worm_strain_id'] + " " + libraryStock;
        var group = "RNAi--" + eegiResult['experimentplate.date'] + "--" + eegiResult['experimentplate.temperature'] + "--" + libraryStock;
        if (!lodash_1.isEqual(eegiResult["experiment.worm_strain_id"], 'N2')) {
            if (lodash_1.isEqual(eegiResult["experimentplate.temperature"], eegiResult['wormstrain.permissive_temperature'])) {
                eegiResult.screenStage = 'permissive';
                eegiResult.screenName = "RNAi Ahringer Secondary " + eegiResult["wormstrain.genotype"] + " Permissive Screen";
                name = name + " Permissive Screen";
                eegiResult.name = name;
            }
            else {
                eegiResult.screenStage = 'restrictive';
                eegiResult.screenName = "RNAi Ahringer Secondary " + eegiResult["wormstrain.genotype"] + " Restrictive Screen";
                name = name + " Permissive Screen";
                eegiResult.name = name;
            }
        }
        eegiResult.barcode = barcode;
        eegiResult.group = group;
    });
    var groupedResults = lodash_1.groupBy(eegiResults, 'group');
    Object.keys(groupedResults).map(function (group) {
        var t = lodash_1.groupBy(groupedResults[group], 'experiment.worm_strain_id');
        Object.keys(t).map(function (wormStrain) {
            var tt = lodash_1.groupBy(t[wormStrain], 'experiment.plate_id');
            Object.keys(tt).map(function (plateId) {
                if (!lodash_1.find(tt[plateId], { 'clone.library': 'Ahringer' })) {
                    delete tt[plateId];
                }
            });
            //Check to ensure that all have the same plateplan
            var allPlateCloneIds = Object.keys(tt).map(function (plateId) {
                return tt[plateId].map(function (eegiResult) {
                    return eegiResult['clone.id'];
                });
            });
            // For secondary screens plate plans need to be the same
            // If they aren't need to figure out which ones are different
            // And probably manually change it
            allPlateCloneIds.map(function (aOnePlateCloneIds) {
                allPlateCloneIds.map(function (bOnePlateCloneIds) {
                    if (!lodash_1.isEqual(aOnePlateCloneIds, bOnePlateCloneIds)) {
                        throw new Error("plate plans for " + group + " are not equal and must be equal for secondary screens!");
                    }
                });
            });
            t[wormStrain] = tt;
        });
        groupedResults[group] = t;
    });
    return groupedResults;
}
function extractPlates(groupedResults) {
    return new Promise(function (resolve, reject) {
        Promise.map(Object.keys(groupedResults), function (group) {
            var wormStrain = Object.keys(groupedResults[group])[0];
            var plates = Object.keys(groupedResults[group][wormStrain]);
            var plate = groupedResults[group][wormStrain][plates[0]];
            return createPlatePlan(plate, group);
        })
            .then(function (platePlans) {
            resolve(platePlans);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
function createPlatePlan(plate, group) {
    var geneNames = plate.map(function (well) {
        return well['clone.id'].replace('sjj_', '');
    });
    var platePlan = new models_1.PlatePlan96ResultSet();
    return new Promise(function (resolve, reject) {
        app.models.RnaiLibrary
            .find({
            where: {
                and: [
                    {
                        geneName: {
                            inq: geneNames,
                        }
                    },
                    {
                        plate: {
                            nlike: 'S%',
                        },
                    }
                ]
            }
        })
            .then(function (rnaiLibaryResults) {
            return app.models.RnaiWormbaseXrefs
                .find({
                where: {
                    wbGeneSequenceId: {
                        inq: rnaiLibaryResults.map(function (rnaiLibraryResult) {
                            return rnaiLibraryResult.geneName;
                        })
                    },
                }
            })
                .then(function (rnaiXrefs) {
                //JOIN
                plate.map(function (eegiResult) {
                    platePlan[eegiResult['experiment.well']] = {};
                    if (lodash_1.isEqual(eegiResult['clone.id'], 'L4440')) {
                        //Its an L4440 Well
                        platePlan[eegiResult['experiment.well']] = {
                            "isValid": true,
                            "well": eegiResult['experiment.well'],
                            "taxTerm": "L4440",
                            "geneName": "L4440",
                            "lookUp": "L4440",
                            "geneData": {}
                        };
                    }
                    else {
                        // Theres a gene
                        var rnaiResult = lodash_1.find(rnaiLibaryResults, { 'geneName': eegiResult['clone.id'].replace('sjj_', '') });
                        if (rnaiResult) {
                            var rnaiXref = lodash_1.find(rnaiXrefs, { wbGeneSequenceId: String(rnaiResult.geneName) });
                            platePlan[eegiResult['experiment.well']] = {
                                "isValid": true,
                                "well": eegiResult['experiment.well'],
                                "taxTerm": eegiResult['clone.id'].replace('sjj_', ''),
                                "geneName": eegiResult['clone.id'].replace('sjj_', ''),
                                "lookUp": rnaiResult.bioloc,
                                "geneData": rnaiXref,
                                "parentLibrary": rnaiResult,
                            };
                        }
                        else {
                            // Its an empty well
                            platePlan[eegiResult['experiment.well']] = {
                                "isValid": true,
                                "well": eegiResult['experiment.well'],
                                geneData: {},
                            };
                        }
                    }
                });
                // @ts-ignore
                platePlan.platePlanUploadDate = new Date();
                platePlan.platePlanName = group;
                return platePlan;
            })
                .catch(function (error) {
                return new Error(error);
            });
        })
            .then(function (platePlan) {
            resolve(platePlan);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
}
var WormStrains = /** @class */ (function () {
    function WormStrains(data) {
        Object.assign(this, data);
    }
    return WormStrains;
}());
exports.WormStrains = WormStrains;
var EegiResults = /** @class */ (function () {
    function EegiResults(data) {
        Object.assign(this, data);
    }
    return EegiResults;
}());
exports.EegiResults = EegiResults;
var minimalWorkflow = {
    "_id": "5af2d6b191f1d80107d9689d",
    "name": "AHR2 2018-04 mip-1;mip-2 Restrictive 25",
    "comment": "reupload",
    platePlan: {},
    "platePlanId": "5af2d2db91f1d80107d9689b",
    "assayViewType": "exp_assay_ahringer2",
    "plateViewType": "exp_plate_ahringer2",
    "instrumentPlateIdLookup": "csPlateid",
    "wells": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12"],
    "screenId": 7,
    "instrumentId": 1,
    "libraryId": 1,
    "screenStage": "secondary",
    "screenType": "restrictive",
    "biosamples": { "experimentBiosample": { "id": "6", "name": "mip-1;mip-2" }, "ctrlBiosample": { "id": "4", "name": "N2" } },
    "libraryModel": "RnaiLibrary",
    "libraryStockModel": "RnaiLibraryStock",
    "reagentLookUp": "rnaiId",
    "instrumentLookUp": "arrayScan",
    "biosampleType": "worm",
    "replicates": [["9807", "9799"], ["9808", "9800"], ["9809", "9801"], ["9810", "9802"], ["9811", "9803"], ["9812", "9804"], ["9813", "9805"], ["9814", "9806"]],
    "conditions": ["treat_rnai", "ctrl_rnai", "ctrl_null", "ctrl_strain"],
    "controlConditions": ["ctrl_strain", "ctrl_null"],
    "experimentConditions": ["treat_rnai", "ctrl_rnai"],
    "biosampleMatchConditions": { "treat_rnai": "ctrl_strain", "ctrl_rnai": "ctrl_null" },
    "experimentMatchConditions": { "treat_rnai": "ctrl_rnai" },
    "experimentDesign": { "treat_rnai": ["ctrl_rnai", "ctrl_strain", "ctrl_null"] },
    "experimentGroups": {
        "treat_rnai": {
            "plates": [{
                    "csPlateid": "9814",
                    "id": "cx5-pc180429150006",
                    "name": "RNAi_Rescreen_Apr_mip_25_8",
                    "creationdate": "2018-04-29T00:00:00.000Z",
                    "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429150006\\",
                    "platebarcode": "CX5-PC15:28:46",
                    "instrumentPlateId": 9814
                }], "biosampleId": "6"
        },
        "ctrl_rnai": {
            "plates": [{
                    "csPlateid": "9806",
                    "id": "cx5-pc180429140008",
                    "name": "RNAi_Rescreen_Apr_N2_25_8",
                    "creationdate": "2018-04-29T00:00:00.000Z",
                    "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429140008\\",
                    "platebarcode": "CX5-PC14:44:38",
                    "instrumentPlateId": 9806
                }], "biosampleId": "4"
        },
        "ctrl_strain": { "biosampleId": "6", "plates": [] },
        "ctrl_null": { "biosampleId": "4", "plates": [] }
    },
    "temperature": 25,
    "librarycode": "ahringer2",
    "screenName": "mip-1;mip-2 Secondary RNAi Restrictive Screen"
};
//# sourceMappingURL=parse_eegi_denorm.js.map