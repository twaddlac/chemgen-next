import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {ExpAssayResultSet, ExpPlateResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import Promise = require('bluebird');

import {PlateCollection, ScreenCollection, WellCollection} from "../../../types/wellData";
import {ExpAssay2reagentResultSet} from "../../../types/sdk/models";
import {isEqual, isArray, orderBy, remove, filter} from 'lodash';

const ExpAssay2reagent = app.models['ExpAssay2reagent'] as (typeof WorkflowModel);

ExpAssay2reagent.load.createAssayStock = function (workflowData: any, expPlateData: PlateCollection) {
  return new Promise(function (resolve, reject) {
    // @ts-ignore
    Promise.map(expPlateData.wellDataList, function (wellData) {
      wellData.stockLibraryData.assayId = wellData.expAssay.assayId;
      let createObj: ExpAssay2reagentResultSet = new ExpAssay2reagentResultSet({
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
ExpAssay2reagent.load.workflows.updateTreatmentGroupId = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection) {
  return new Promise((resolve, reject) => {
    let data: any = {};
    data.expAssay2reagents = [];
    data.expAssays = [];

    screenData.plateDataList.map((plateData: PlateCollection) => {
      plateData.wellDataList.map((wellData: WellCollection) => {
        if (wellData.expAssay2reagent.expGroupId) {
          data.expAssay2reagents.push(wellData.expAssay2reagent);
        }
        if(wellData.expAssay.expGroupId){
          data.expAssays.push(wellData.expAssay);
        }
      });
    });

    remove(data.expAssay2reagents, {reagentType: 'ctrl_null'});
    remove(data.expAssay2reagents, {reagentType: 'ctrl_strain'});

    ExpAssay2reagent.load.filterExpAssay2reagent(data['expAssays'], data['expAssay2reagents'], screenData)
      .then(() => {
        app.winston.info(`Complete updating ExpAssay2reagents`);
        resolve();
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

ExpAssay2reagent.load.filterExpAssay2reagent = function (expAssays: ExpAssayResultSet[], expAssay2reagentsAll: ExpAssay2reagentResultSet[], screenData: ScreenCollection) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(expAssays, (expAssay: ExpAssayResultSet) => {
      let expAssay2reagents = filter(expAssay2reagentsAll, (expAssay2reagent) => {
        return isEqual(Number(expAssay.assayId), Number(expAssay2reagent.assayId));
      });
      return ExpAssay2reagent.load.updateExpAssay2reagent(expAssay, expAssay2reagents, screenData)
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(error));
      });
  });
};

ExpAssay2reagent.load.updateExpAssay2reagent = function (expAssay: ExpAssayResultSet, expAssay2reagents: ExpAssay2reagentResultSet[], screenData: ScreenCollection) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(expAssay2reagents, (expAssay2reagent: ExpAssay2reagentResultSet) => {
      expAssay2reagent.expGroupId = expAssay.expGroupId;
      expAssay2reagent.expWorkflowId = expAssay.expWorkflowId;
      if (expAssay.expGroupId) {
        return app.models.ExpDesign.extract.workflows
          .getExpSetByExpGroupId(expAssay.expGroupId, screenData.expDesignList)
          .then((results) => {
            if (!isEqual(expAssay2reagent.reagentType, 'ctrl_null') && !isEqual(expAssay2reagent.reagentType, 'ctrl_strain')) {
              if(isArray(results) && results.length){
                expAssay2reagent.treatmentGroupId = results[0].treatmentGroupId;
              }
            }
            return app.models.ExpAssay2reagent.upsert(expAssay2reagent)
          })
          .then(() => {
            return;
          })
          .catch((error) => {
            app.winston.error(error);
            reject(new Error(error));
          });
      } else {
        return app.models.ExpAssay2reagent
          .upsert(expAssay2reagent)
          .then((results) => {
            return;
          })
          .catch((error) => {
            app.winston.error(error);
            reject(new Error(error));
          });
      }
    }, {concurrency: 1})
      .then(() => {
        resolve();
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};
