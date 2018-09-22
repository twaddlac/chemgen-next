import app  = require('../../../../../server/server.js');

import {PlatePlan96ResultSet, ChemicalLibraryResultSet} from "../../../../types/sdk/models";
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');
import {get, padStart, isEqual, isEmpty, isNull} from 'lodash';

const ChemicalLibrary = app.models.ChemicalLibrary as (typeof WorkflowModel);

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
ChemicalLibrary.extract.secondary.getLibraryInfo = function (workflowData: any, barcode: string) {

  return new Promise(function (resolve, reject) {
    if (!get(workflowData, 'platePlanId')) {
      reject(new Error('Secondary screens must have a platePlan!'));
    } else {
      if(isEmpty(workflowData.platePlan) || isNull(workflowData.platePlan)){
        reject(new Error('Not able to find a valid platePlan'));
      }
      else{
        // workflowData.platePlan = platePlan;
        //TODO Add hook for multiple library entries per well
        const wells = initialize96Wells();
        let libraryInfoList: ChemicalLibraryResultSet[] = [];
        wells.map((well) => {
          if(! get(workflowData.platePlan, [ well, 'lookUp'])){
            return;
          } else if (isEqual(workflowData.platePlan[well].lookUp, 'empty')) {
            return;
          } else if (isEqual(workflowData.platePlan[well].lookUp, 'DMSO')) {
            const libraryInfo: any = {};
            libraryInfo.well = well;
            libraryInfo.compoundSystematicName = 'DMSO';
            libraryInfo.taxTerm = 'DMSO';

            libraryInfoList.push(libraryInfo);
          } else {
            const libraryInfo = get(workflowData.platePlan, [ well, 'parentLibrary']);
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
        });
        resolve(libraryInfoList);
      }
    }
  });
};

function getPlatePlanWell(wellData: any, well: string, libraryInfoList: Array<any>){

  if(! get(wellData, [  'lookUp'])){
    return;
  } else if (isEqual(wellData.lookUp, 'empty')) {
    return;
  } else if (isEqual(wellData.lookUp, 'DMSO')) {
    const libraryInfo: any = {};
    libraryInfo.well = well;
    libraryInfo.compoundSystematicName = 'DMSO';
    libraryInfo.taxTerm = 'DMSO';

    libraryInfoList.push(libraryInfo);
  } else {
    const libraryInfo = get(wellData, [ 'parentLibrary']);
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
  const rows: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const columns = [];
  const wells = [];

  for (let i = 1; i <= 12; i++) {
    const column = padStart(String(i), 2, '0');
    columns.push(column);
  }
  rows.forEach((row) => {
    columns.forEach((column) => {
      const well = `${row}${column}`;
      wells.push(well);
    });
  });
  return wells;
}

