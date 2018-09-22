import app  = require('../../../../../server/server.js');

import {RnaiLibraryResultSet} from "../../../../types/sdk/models";
import {WorkflowModel} from "../../../index";
import Promise = require('bluebird');

const RnaiLibrary = app.models.RnaiLibrary as (typeof WorkflowModel);

//TODO Change this get plateplan
RnaiLibrary.extract.primary.getParentLibrary = function(workflowData, barcode) {
  return new Promise(function(resolve, reject) {
    RnaiLibrary.extract.primary.getLibraryInfo(workflowData, barcode)
      .then(function(results) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};

/**
 * Get the vendor/parent library data for a particular screen
 * In the primary screen 1 plate corresponds to 1 chrom-plate-quadrant location
 * In the secondary screen genes are cherry picked, and can come from any location
 * @param workflowData
 * @param {string} barcode
 */
RnaiLibrary.extract.primary.getLibraryInfo = function(workflowData : any , barcode : string) {
  const quadrant = RnaiLibrary.helpers.getQuad(barcode);
  const plate = RnaiLibrary.helpers.getPlate(workflowData.search.rnaiLibrary.plate);
  const chrom = workflowData.search.rnaiLibrary.chrom;
  const where =  {
    stocktitle: chrom + '-' + plate + '--' + quadrant,
  };

  return new Promise(function(resolve, reject) {
    RnaiLibrary.find({
        where: where,
      })
      .then(function(results : RnaiLibraryResultSet[]) {
        resolve(results);
      })
      .catch(function(error) {
        reject(new Error(error));
      });
  });
};
