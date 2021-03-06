import app  = require('../../../../server/server.js');

import {ExpPlateResultSet} from "../../";
import {WorkflowModel} from "../../index";
import Promise = require('bluebird');

import {PlateCollection, WellCollection} from "../../../types/custom/wellData";

const RnaiLibraryStock = app.models['RnaiLibraryStock'] as (typeof WorkflowModel);

//TODO This should not be created here - but after we create the expAssay
RnaiLibraryStock.load.createStocks = function (workflowData: any, expPlateData: PlateCollection) {
  return new Promise(function (resolve, reject) {
    Promise.map(expPlateData.wellDataList, function (wellData) {
      wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
      let createObj = wellData.stockLibraryData;

      return app.models.RnaiLibraryStock
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
