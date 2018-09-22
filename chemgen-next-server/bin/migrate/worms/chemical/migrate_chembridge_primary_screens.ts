import app = require('../../../../server/server.js')
import jsonfile = require('jsonfile');
import path = require('path');
import deepcopy = require('deepcopy');
import Promise = require('bluebird');
import {ExpScreenUploadWorkflowResultSet, PlateResultSet} from "../../../../common/types/sdk/models";
import {get, isEqual, flatten, range, groupBy, slice, shuffle} from 'lodash';

/***
 * WIP
 * This should run all kinds of queries against the arrayscan DB to get the chemical screens
 */

let chembridgeFile = path.resolve(__dirname, 'data', 'primary', 'chembridge_primary_OLD.json');
let chembridgeData = jsonfile.readFileSync(chembridgeFile);
let minimalWorkflow = jsonfile.readFileSync(path.resolve(__dirname, 'data', 'primary', 'minimal_primary.json'));

let migrateWorkflow = function (oldWorkflowData, plate, libraryPlate, quadrant, expGroup) {
  let thisWorkflow: ExpScreenUploadWorkflowResultSet = deepcopy(minimalWorkflow);

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

let combineGroupedPlates = function (grouped) {
  let allWorkflows = [];
  Object.keys(grouped).map((key) => {
    let ctrlPlates = [];
    let treatPlates = [];
    let allTheseScreens = grouped[key];
    let assayDates = [];
    let workflowData = deepcopy(allTheseScreens[0]);
    allTheseScreens.map((screen: ExpScreenUploadWorkflowResultSet) => {
      screen.experimentGroups.ctrl_chemical.plates.map((plate) => {
        ctrlPlates.push(plate);
      });
      screen.experimentGroups.treat_chemical.plates.map((plate) => {
        treatPlates.push(plate);
      });
      assayDates.push(screen.stockPrepDate);
    });
    if (isEqual(ctrlPlates.length, 0) ){
      throw new Error(`Ctrl plates for plate ${key} are empty!`);
    }
    if (isEqual(treatPlates.length, 0) ){
      throw new Error(`Treat plates for plate ${key} are empty!`);
    }
    workflowData.temperature = 20;
    workflowData.name = `CHEM Chembridge Primary ${key} ${assayDates[0]}`;
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

let createSearch = function (workflowData) {
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
        'name': {'nlike': 'MFGTMP%'}
      },
      {
        "or": workflowData.imageDates,
      }
    ]
  };
};

let findPlates = function (workflowData) {
  console.log('finding plates');
  return new Promise((resolve, reject) => {
    let where = createSearch(workflowData);
    let search = {
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
    let expGroup;
    if (get(workflowData, ['data', 'wormStrain'])) {
      let wormStrain = get(workflowData, ['data', 'wormStrain']);
      if (isEqual(wormStrain, 'N2')) {
        expGroup = 'ctrl_chemical';
      } else {
        expGroup = 'treat_chemical';
      }
    } else {
      reject(new Error('there is no wormstrain!'));
    }
    console.log(`ExpGroup: ${expGroup}`);
    console.log(workflowData.assayDate);

    app.models.Plate
      .find(search)
      .then((results: PlateResultSet[]) => {
        // console.log(`Results length: ${results.length}`);
        console.log(JSON.stringify(results));
        if (results.length == 0) {
          reject(new Error(`No Plates found for search ${JSON.stringify(search)}`));
        }
        let newWorkflowData = [];
        results.map((result: PlateResultSet) => {
          let newData = deepcopy(workflowData);
          //Parse the barcode for the plate number and quadrant
          let plateObj;
          try {
            plateObj = app.models.ChemicalLibrary.helpers.chembridge.parseBarcode(result.name);
          } catch (error) {
            reject(new Error(error));
          }
          let plate, quadrant;
          if (get(plateObj, 'plateIndex')) {
            plate = plateObj.plateIndex;
            quadrant = plateObj.Q;
          } else {
            reject(new Error(`No plateIndex found for ${result.name}`));
          }
          //Migrate the old workflow format to the new
          let newWorkflow;
          try {
            newWorkflow = migrateWorkflow(workflowData, result, plate, quadrant, expGroup);
          } catch (error) {
            reject(new Error(`Error migrating workflow ${error}`));
          }
          newWorkflowData.push(newWorkflow);
        });
        resolve(newWorkflowData);
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
};


let parseWorkflowData = function (workflowDataList) {
  console.log('parsing workflow data');

  return new Promise((resolve, reject) => {
    Promise.map(workflowDataList, (workflowData) => {
      return findPlates(workflowData);
    })
      .then((results) => {
        console.log('complete!');
        results = flatten(results);
        let grouped = groupBy(results, (result) => {
          return result.search.library.chemical.chembridge.plate;
        });
        // let firstGroup = deepcopy(grouped['98']);
        // grouped = {};
        // grouped['98'] = firstGroup;

        jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all.json'), results, {spaces: 2});
        jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all_primary_by_plate.json'), grouped, {spaces: 2});
        let allWorkflows = combineGroupedPlates(grouped);
        jsonfile.writeFileSync(path.resolve(__dirname, 'data', 'primary', 'chembridge_all_grouped.json'), allWorkflows, {spaces: 2});
        console.log('writing out plate file');
        console.log(`Plates found: ${JSON.stringify(Object.keys(grouped))}`);
        console.log(`Number of workflows: ${allWorkflows.length}`);
        process.exit(0);
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });

  });
};

// chembridgeData = shuffle(chembridgeData);
// chembridgeData = slice(chembridgeData, 0, 10);
parseWorkflowData(chembridgeData);
