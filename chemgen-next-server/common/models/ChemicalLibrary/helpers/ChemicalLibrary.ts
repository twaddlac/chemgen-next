import app  = require('../../../../server/server.js');
import * as _ from "lodash";
import {ChemicalLibraryResultSet} from "../../../types/sdk/models";
import {WorkflowModel} from "../../index";

const ChemicalLibrary = app.models['ChemicalLibrary'] as (typeof WorkflowModel);

ChemicalLibrary.helpers.chembridge = {};

ChemicalLibrary.helpers.genLibraryResult = function (barcode: string, libraryResults: ChemicalLibraryResultSet[], well: string) {
  let libraryResult: ChemicalLibraryResultSet = _.find(libraryResults, {
    well: well,
  });
  libraryResult = ChemicalLibrary.helpers.checkLibraryResult(libraryResult);
  return libraryResult;
};

/**
 * Library is undef for empty wells
 * Add in a name and a taxTerm
 * @param  {Object | Undefined} libraryResult [Library record for that well]
 * @return {Object}               [Create a library result if it doesn't exist]
 */
ChemicalLibrary.helpers.checkLibraryResult = function (libraryResult: ChemicalLibraryResultSet) {
  if (!libraryResult) {
    libraryResult = {};
    // libraryResult.taxTerm = 'empty';
    libraryResult.compoundSystematicName = 'empty';
  }
  return libraryResult;
};


/**
 * Chembridge barcodes are weird
 * They come in groups of 4 (I don't know why)
 * M11M12M13M14Q1 <- Is library plate 11
 * M11M12M13M14Q2 <- Is library plate 12
 * M11M12M13M14Q3 <- Is library plate 13
 * M11M12M13M14Q4 <- Is library plate 14
 * Except that sometimes they don't
 * And they are just M1 <- and then it is library Plate 1
 * This is mostly deprecated functionality, and shouldn't be needed
 * Except to migrate over old plate plans
 * @param barcode
 * @returns {any}
 */
ChemicalLibrary.helpers.chembridge.parseBarcode = function (barcode) {
  let origList = barcode.split('M');
  let plateObj;
  if (origList.length === 2) {
    plateObj = ChemicalLibrary.helpers.chembridge.singlePlate(origList);
  } else if (origList.length === 5) {
    plateObj = ChemicalLibrary.helpers.chembridge.withQuad(origList);
  } else {
    throw (new Error('Unparsable barcode ' + barcode));
  }

  return plateObj;
};

/**
 * Barcode looks like M1M2M3M4Q1
 * @param origList
 * @returns {any}
 */
ChemicalLibrary.helpers.chembridge.withQuad = function (origList) {
  let last = origList[4];
  let regexp = /(\d{1})DQ(\d{1})/;
  let plateData: any = regexp.exec(last);
  let pad = '0000';
  let plateObj: any = {};
  let newLast, plateList;

  if (plateData) {
    newLast = last.replace(plateData[0], '');
    plateList = [origList[1], origList[2], origList[3], newLast];

    plateObj = {
      plateList: plateList,
      Q: plateData[2],
      plateIndex: plateList[plateData[2] - 1],
      D: plateData[1],
    };
  } else {
    regexp = /Q(\d{1})/;

    plateData = regexp.exec(last);

    newLast = last.replace(plateData[0], '');
    plateList = [origList[1], origList[2], origList[3], newLast];

    plateObj = {
      plateList: plateList,
      Q: plateData[1],
      plateIndex: plateList[plateData[1] - 1],
    };
  }

  let plateIndexStr = String(plateObj.plateIndex);
  plateObj.plateName = pad.substring(0, pad.length - plateIndexStr.length) +
    plateIndexStr;

  return plateObj;
};

/**
 * Barcode is just M1
 * @param plateList
 * @returns {any}
 */
ChemicalLibrary.helpers.chembridge.singlePlate = function (plateList) {
  let regexp = /(\d+)/;
  let plateData = regexp.exec(plateList[1]);
  let pad = '0000';

  let plateObj: any = {
    plateList: [plateList[1]],
    Q: 1,
    plateIndex: plateData[0],
  };

  let plateIndexStr = String(plateObj.plateIndex);
  plateObj.plateName = pad.substring(0, pad.length - plateIndexStr.length) +
    plateIndexStr;

  return plateObj;
};

