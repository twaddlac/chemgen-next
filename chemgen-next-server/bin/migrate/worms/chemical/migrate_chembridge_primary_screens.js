"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var jsonfile = require("jsonfile");
var path = require("path");
var deepcopy = require("deepcopy");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
/***
 * WIP
 * This should run all kinds of queries against the arrayscan DB to get the chemical screens
 */
var chembridgeFile = path.resolve(__dirname, 'data', 'primary', 'chembridge_primary_OLD.json');
var chembridgeData = jsonfile.readFileSync(chembridgeFile);
var minimalWorkflow = jsonfile.readFileSync(path.resolve(__dirname, 'data', 'primary', 'minimal_primary.json'));
var migrateWorkflow = function (oldWorkflowData, plate, libraryPlate, quadrant, expGroup) {
    var thisWorkflow = deepcopy(minimalWorkflow);
    thisWorkflow.experimentGroups[expGroup].plates = [plate];
    thisWorkflow.stockPrepDate = oldWorkflowData.assayDate;
    thisWorkflow.search = {
        library: {
            chemical: {
                chembridge: {
                    plate: libraryPlate,
                    quadrant: quadrant
                }
            }
        }
    };
    return thisWorkflow;
};
var combineGroupedPlates = function (grouped) {
    var allWorkflows = [];
    Object.keys(grouped).map(function (key) {
        var ctrlPlates = [];
        var treatPlates = [];
        var allTheseScreens = grouped[key];
        var assayDates = [];
        var workflowData = deepcopy(allTheseScreens[0]);
        allTheseScreens.map(function (screen) {
            screen.experimentGroups.ctrl_chemical.plates.map(function (plate) {
                ctrlPlates.push(plate);
            });
            screen.experimentGroups.treat_chemical.plates.map(function (plate) {
                treatPlates.push(plate);
            });
            assayDates.push(screen.stockPrepDate);
        });
        if (lodash_1.isEqual(ctrlPlates.length, 0)) {
            throw new Error("Ctrl plates for plate " + key + " are empty!");
        }
        if (lodash_1.isEqual(treatPlates.length, 0)) {
            throw new Error("Treat plates for plate " + key + " are empty!");
        }
        workflowData.temperature = 20;
        workflowData.name = "CHEM Chembridge Primary " + key + " " + assayDates[0];
        workflowData.assayDates = assayDates;
        workflowData.experimentGroups.ctrl_chemical.plates = ctrlPlates;
        workflowData.experimentGroups.ctrl_chemical.temperature = 20;
        workflowData.experimentGroups.treat_chemical.plates = treatPlates;
        workflowData.experimentGroups.treat_chemical.temperature = 22.5;
        workflowData.libraryId = 2;
        allWorkflows.push(workflowData);
    });
    return allWorkflows;
};
var createSearch = function (workflowData) {
    return {
        "and": [
            {
                "or": [
                    {
                        "name": {
                            "like": "M%"
                        }
                    },
                ]
            },
            {
                'name': { 'nlike': 'MFGTMP%' }
            },
            {
                "or": workflowData.imageDates,
            }
        ]
    };
};
var findPlates = function (workflowData) {
    console.log('finding plates');
    return new Promise(function (resolve, reject) {
        var where = createSearch(workflowData);
        var search = {
            where: where,
            fields: {
                csPlateid: true,
                id: true,
                name: true,
                platebarcode: true,
                creationdate: true,
                imagepath: true
            }
        };
        //Get the wormstrain from the old workflowData
        //to assign the experiment group
        var expGroup;
        if (lodash_1.get(workflowData, ['data', 'wormStrain'])) {
            var wormStrain = lodash_1.get(workflowData, ['data', 'wormStrain']);
            if (lodash_1.isEqual(wormStrain, 'N2')) {
                expGroup = 'ctrl_chemical';
            }
            else {
                expGroup = 'treat_chemical';
            }
        }
        else {
            reject(new Error('there is no wormstrain!'));
        }
        console.log("ExpGroup: " + expGroup);
        console.log(workflowData.assayDate);
        app.models.Plate
            .find(search)
            .then(function (results) {
            // console.log(`Results length: ${contactSheetResults.length}`);
            console.log(JSON.stringify(results));
            if (results.length == 0) {
                reject(new Error("No Plates found for search " + JSON.stringify(search)));
            }
            var newWorkflowData = [];
            results.map(function (result) {
                var newData = deepcopy(workflowData);
                //Parse the barcode for the plate number and quadrant
                var plateObj;
                try {
                    plateObj = app.models.ChemicalLibrary.helpers.chembridge.parseBarcode(result.name);
                }
                catch (error) {
                    reject(new Error(error));
                }
                var plate, quadrant;
                if (lodash_1.get(plateObj, 'plateIndex')) {
                    plate = plateObj.plateIndex;
                    quadrant = plateObj.Q;
                }
                else {
                    reject(new Error("No plateIndex found for " + result.name));
                }
                //Migrate the old workflow format to the new
                var newWorkflow;
                try {
                    newWorkflow = migrateWorkflow(workflowData, result, plate, quadrant, expGroup);
                }
                catch (error) {
                    reject(new Error("Error migrating workflow " + error));
                }
                newWorkflowData.push(newWorkflow);
            });
            resolve(newWorkflowData);
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
};
var parseWorkflowData = function (workflowDataList) {
    console.log('parsing workflow data');
    return new Promise(function (resolve, reject) {
        Promise.map(workflowDataList, function (workflowData) {
            return findPlates(workflowData);
        })
            .then(function (results) {
            console.log('complete!');
            results = lodash_1.flatten(results);
            var grouped = lodash_1.groupBy(results, function (result) {
                return result.search.library.chemical.chembridge.plate;
            });
            // let firstGroup = deepcopy(grouped['98']);
            // grouped = {};
            // grouped['98'] = firstGroup;
            jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all.json'), results, { spaces: 2 });
            jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all_primary_by_plate.json'), grouped, { spaces: 2 });
            var allWorkflows = combineGroupedPlates(grouped);
            jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all_grouped.json'), allWorkflows, { spaces: 2 });
            console.log('writing out plate file');
            console.log("Plates found: " + JSON.stringify(Object.keys(grouped)));
            console.log("Number of workflows: " + allWorkflows.length);
            process.exit(0);
        })
            .catch(function (error) {
            console.log(error);
            reject(new Error(error));
        });
    });
};
// chembridgeData = shuffle(chembridgeData);
// chembridgeData = slice(chembridgeData, 0, 10);
parseWorkflowData(chembridgeData);
//# sourceMappingURL=migrate_chembridge_primary_screens.js.map