"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var _ = require("lodash");
var request = require('request-promise');
var deepcopy = require('deepcopy');
var ExpAssay = app.models['ExpAssay'];
var ModelPredictedPheno = app.models['ModelPredictedPheno'];
//TODO Schedule this some hours in the future to ensure images are converted first
ModelPredictedPheno.load.workflows.parseScreen = function (workflowData, screenData) {
    return new Promise(function (resolve, reject) {
        //Have to set these to concurrency 1 or else we overload the server
        Promise.map(screenData.plateDataList, function (plateData) {
            return Promise.map(plateData.wellDataList, function (wellData) {
                return ModelPredictedPheno.load.workflows.processAssay(workflowData, wellData);
            }, { concurrency: 1 });
        }, { concurrency: 1 })
            .then(function () {
            resolve(screenData);
        })
            .catch(function (error) {
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
ModelPredictedPheno.load.workflows.processAssay = function (workflowData, wellData) {
    return new Promise(function (resolve, reject) {
        if (_.isEqual(wellData.annotationData.taxTerm, 'empty')) {
            resolve(wellData);
        }
        else {
            ModelPredictedPheno.findOne({ where: { assayId: wellData.expAssay.assayId } })
                .then(function (result) {
                if (!_.isEmpty(result)) {
                    wellData.modelPredictedPheno = result;
                    resolve(wellData);
                }
                else {
                    return ModelPredictedPheno.load.getPhenos(workflowData, wellData)
                        .then(function (result) {
                        wellData.modelPredictedPheno = result;
                        resolve(wellData);
                    })
                        .catch(function (error) {
                        app.winston.error(error.stack);
                        reject(new Error(error));
                    });
                }
            })
                .catch(function (error) {
                app.winston.error(error.stack);
                reject(new Error(error));
            });
        }
    });
};
/**
 * TODO This is hard coded for a particular model - which is NO GOOD
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {WellCollection} wellData
 */
ModelPredictedPheno.load.getPhenos = function (workflowData, wellData) {
    var phenoJob = { image_file: "/mnt/image/" + wellData.expAssay.assayImagePath + "-autolevel.bmp" };
    return new Promise(function (resolve, reject) {
        return request({
            uri: 'http://onyx.abudhabi.nyu.edu:5001/api/label_image/',
            body: phenoJob,
            method: 'POST',
            json: true,
        })
            .then(function (response) {
            app.winston.info(JSON.stringify(response));
            var conclusion = _.get(response, ['top_hits', phenoJob.image_file, 'conclusion']);
            var reagentId = _.get(wellData, ['expAssay2reagent', 'reagentId']);
            if (!_.isUndefined(conclusion)) {
                var phenoData = {
                    screenId: workflowData.screenId,
                    modelId: 1,
                    conclusion: conclusion,
                    assayId: wellData.expAssay.assayId,
                    plateId: wellData.expAssay.plateId,
                    assayImagePath: wellData.expAssay.assayImagePath,
                    reagentId: reagentId,
                };
                var createObj = deepcopy(phenoData);
                createObj.screenMeta = JSON.stringify(response, null, 2);
                return ModelPredictedPheno
                    .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(phenoData) }, createObj);
            }
            else {
                resolve({});
            }
        })
            .then(function (results) {
            app.winston.info(JSON.stringify(results));
            if (!_.isEmpty(results)) {
                resolve(results[0]);
            }
            else {
                app.winston.error("Results are " + JSON.stringify(results));
                reject(new Error('Results not as expected'));
            }
        })
            .catch(function (error) {
            app.winston.error(error.stack);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ModelPredictedPheno.js.map