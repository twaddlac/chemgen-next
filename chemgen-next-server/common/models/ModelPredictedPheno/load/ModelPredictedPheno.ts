import app  = require('../../../../server/server.js');
import config = require('config');

import {
  ExpAssayResultSet, ExpGroupResultSet, ExpPlateResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedPhenoResultSet,
  WpTermsResultSet, WpTermTaxonomyResultSet
} from "../../../types/sdk/models/index";
import {WorkflowModel} from "../../index";
import {PlateCollection, WellCollection, ScreenCollection} from "../../../types/custom/wellData";

import Promise = require('bluebird');
import * as _ from "lodash";
import fs = require('fs');
import {Model} from "loopback";

const request = require('request-promise');
const deepcopy = require('deepcopy');

const ExpAssay = app.models['ExpAssay'] as (typeof WorkflowModel);
const ModelPredictedPheno = app.models['ModelPredictedPheno'] as (typeof WorkflowModel);


//TODO Schedule this some hours in the future to ensure images are converted first

ModelPredictedPheno.load.workflows.parseScreen = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection) {
  return new Promise((resolve, reject) => {
    //Have to set these to concurrency 1 or else we overload the server
    Promise.map(screenData.plateDataList, (plateData: PlateCollection) => {
      return Promise.map(plateData.wellDataList, (wellData: WellCollection) => {
        return ModelPredictedPheno.load.workflows.processAssay(workflowData, wellData);
      }, {concurrency: 1});
    }, {concurrency: 1})
      .then(() => {
        resolve(screenData);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

// ModelPredictedPheno.load.workflows.parsePlates = function(workflowData: ExpScreenUploadWorkflowResultSet, plateData: PlateCollection){
//   return new Promise((resolve, reject) =>{
//
//   });
// };

/**
 * First look for the assay
 * If it doesn't exist create
 * @param workflowData
 * @param {WellCollection} wellData
 */
ModelPredictedPheno.load.workflows.processAssay = function (workflowData, wellData: WellCollection) {
  return new Promise((resolve, reject) => {
    if (_.isEqual(wellData.annotationData.taxTerm, 'empty')) {
      resolve(wellData);
    }
    else {
      ModelPredictedPheno.findOne({where: {assayId: wellData.expAssay.assayId}})
        .then((result: ModelPredictedPhenoResultSet) => {
          if (!_.isEmpty(result)) {
            wellData.modelPredictedPheno = result;
            resolve(wellData);
          } else {
            return ModelPredictedPheno.load.getPhenos(workflowData, wellData)
              .then((result) => {
                wellData.modelPredictedPheno = result;
                resolve(wellData);
              })
              .catch((error) => {
                app.winston.error(error.stack);
                reject(new Error(error));
              });
          }
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
  })
};

/**
 * TODO This is hard coded for a particular model - which is NO GOOD
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {WellCollection} wellData
 */
ModelPredictedPheno.load.getPhenos = function (workflowData: ExpScreenUploadWorkflowResultSet, wellData: WellCollection) {
  let phenoJob = {image_file: `/mnt/image/${wellData.expAssay.assayImagePath}-autolevel.bmp`};
  return new Promise((resolve, reject) => {
    return request({
      uri: 'http://onyx.abudhabi.nyu.edu:5001/api/label_image/',
      body: phenoJob,
      method: 'POST',
      json: true,
    })
      .then((response) => {
        app.winston.info(JSON.stringify(response));
        let conclusion = _.get(response, ['top_hits', phenoJob.image_file, 'conclusion']);
        let reagentId = _.get(wellData, ['expAssay2reagent', 'reagentId']);
        if (!_.isUndefined(conclusion)) {
          let phenoData = {
            screenId: workflowData.screenId,
            modelId: 1,
            conclusion: conclusion,
            assayId: wellData.expAssay.assayId,
            plateId: wellData.expAssay.plateId,
            assayImagePath: wellData.expAssay.assayImagePath,
            reagentId: reagentId,
          };
          let createObj = deepcopy(phenoData);
          createObj.screenMeta = JSON.stringify(response, null, 2);
          return ModelPredictedPheno
            .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(phenoData)}, createObj)
        }
        else {
          resolve({});
        }
      })
      .then((results) => {
        app.winston.info(JSON.stringify(results));
        if (!_.isEmpty(results)) {
          resolve(results[0]);
        }
        else {
          app.winston.error(`Results are ${JSON.stringify(results)}`);
          reject(new Error('Results not as expected'));
        }
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};
