"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../server/server.js");
var path = require("path");
var wellData_1 = require("../../../../types/custom/wellData");
var slug = require("slug");
var Promise = require("bluebird");
var Mustache = require("mustache");
var _ = require("lodash");
var lodash_1 = require("lodash");
// @ts-ignore
var readFile = Promise.promisify(require('fs').readFile);
var ExpAssay = app.models['ExpAssay'];
/**
 * Workflows for creating web interfaces for the ExpAssays (Assays are a single well)
 * TODO Update the wordpress posts to just use a regular html gallery instead of the envira gallery
 */
/**
 *
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.createExpAssayInterfaces = function (workflowData, screenData, plateData) {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        Promise.map(plateData.wellDataList, function (wellData) {
            return ExpAssay.load.workflows.getAssayRelations(workflowData, screenData, plateData, wellData)
                .then(function (expSet) {
                var annotationData = ExpAssay.load.mapAssayRelations(workflowData, expSet);
                return ExpAssay.load.genHtmlView(workflowData, screenData, plateData, wellData, annotationData);
            })
                .then(function (postContent) {
                //Create the html and image posts
                return ExpAssay.load.workflows.createWpPosts(workflowData, plateData, wellData, postContent);
            })
                .then(function (results) {
                //Then associate taxTerms to posts
                return ExpAssay.load.workflows.createPostTaxRels(workflowData, screenData, wellData, results);
            })
                .catch(function (error) {
                app.winston.error('Error in ExpAssay.load.createExpAssayInterfaces .map');
                reject(new Error(error));
            });
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.workflows.createExpAssayInterfaces');
            reject(new Error(error));
        });
    });
};
/**
 * For each Assay we need to oet the associated Experiment Data with it (Called the ExpSet)
 * 1. Get Exp Design
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 * @param {PlateCollection} plateData
 * @param {WellCollection} wellData
 */
ExpAssay.load.workflows.getAssayRelations = function (workflowData, screenData, plateData, wellData) {
    return new Promise(function (resolve, reject) {
        app.models.ExpDesign.extract.workflows.getExpSetByExpGroupId(wellData.expGroup.expGroupId, screenData.expDesignList)
            .then(function (expDesignList) {
            var expGroups = [];
            if (lodash_1.isEmpty(expDesignList)) {
                //Its an empty well
                resolve(null);
            }
            else {
                //The treatmentGroupIds are always the same
                expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesignList[0].treatmentGroupId, screenData));
                lodash_1.map(expDesignList, function (expDesign) {
                    expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesign.controlGroupId, screenData));
                });
                var expSet = new wellData_1.ExpSet({ expDesignList: expDesignList, expGroupList: expGroups });
                resolve(expSet);
            }
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.getAssayRelations');
            reject(new Error(error));
        });
    });
};
/**
 * ExpAssay.load.mapAssayRelations
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ExpSet} expSet
 */
ExpAssay.load.mapAssayRelations = function (workflowData, expSet) {
    if (lodash_1.isEmpty(expSet) || lodash_1.isNull(expSet)) {
        return {};
    }
    else {
        return lodash_1.keyBy(expSet.expGroupList, 'expGroupType');
    }
};
/**
 * ExpAssay.load.createBaseExpAssayView
 * Create the default html view for the Exp Assay
 * TODO - Create a file resolver to allow for customized templates
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ExpPlateResultSet} expPlate
 * @param {WellCollection} wellData
 * /common/views/exp/assay/worm/RnaiLibrary/expAssay-rnailibrary-ahringer2-primary-permissive.mustache
 */
// return ExpAssay.load.genHtmlView(workflowData, screenData, plateData, wellData, annotationData);
ExpAssay.load.genHtmlView = function (workflowData, screenData, plateData, wellData, annotationData) {
    var templateName = workflowData.librarycode + "-" + workflowData.screenStage + ".mustache";
    var templateFile = path.join(path.dirname(__filename), "../../../../../common/views/exp/assay/" + workflowData.biosampleType + "/" + workflowData.libraryModel + "/expAssay-" + templateName);
    var screenType = _.capitalize(workflowData.screenType);
    //TODO Generate WpUrl for Plate
    var table = app.models.WpTerms.load.genTermTable(wellData.annotationData.taxTerms);
    var libraryData = app.models[workflowData.libraryModel].load.genLibraryViewData(workflowData, wellData);
    return new Promise(function (resolve, reject) {
        readFile(templateFile, 'utf8')
            .then(function (contents) {
            var assayView = Mustache.render(contents, {
                libraryData: libraryData,
                screenType: screenType,
                wellData: wellData,
                expPlate: plateData.expPlate,
                workflowData: workflowData,
                annotationData: annotationData,
                table: table,
                hasTaxTerm: !wellData.annotationData.taxTerm.match('L4440') || wellData.annotationData.taxTerm.match('empty'),
            });
            resolve(assayView);
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.genHtmlView');
            reject(new Error(error));
        });
    });
};
/**
 * Here is where the content is actually loaded into the Wordpress WpPosts table
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 * @param {WellCollection} wellData
 * @param {string} postContent
 */
ExpAssay.load.workflows.createWpPosts = function (workflowData, plateData, wellData, postContent) {
    return new Promise(function (resolve, reject) {
        var plateId = plateData.expPlate.plateId;
        //TODO Update this
        // It should Be Barcode Date Replicate#
        var title = plateId + "-" + wellData.expAssay.assayCodeName;
        //TODO Make this site Specific
        var assayImagePath = wellData.expAssay.assayImagePath || plateData.expPlate.plateImagePath + "/" + plateData.expPlate.barcode + "_" + wellData.stockLibraryData.well;
        var postData = {
            viewType: workflowData.assayViewType,
            title: title,
            titleSlug: slug(title),
            postContent: postContent,
            postExcerpt: '',
            //TODO Make this site Specific
            imagePath: assayImagePath + "-autolevel.jpeg",
        };
        app.models.WpPosts.load.workflows.createPost(workflowData, postData)
            .then(function (result) {
            //genImagePost resolves both the assayPost and the imagePost
            //Need to associate tax terms to each of them
            return app.models.WpPosts.load.workflows.genImagePost(result, postData);
        })
            .then(function (postData) {
            return ExpAssay.load.updateExpAssay(wellData, postData);
        })
            .then(function (postData) {
            resolve(postData);
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.workflows.createWpPosts');
            reject(new Error(error));
        });
    });
};
/**
 * Once we have the created the expAssay interface, update the ResultSet with the post Id
 * @param {WellCollection} wellData
 * @param postData
 */
ExpAssay.load.updateExpAssay = function (wellData, postData) {
    return new Promise(function (resolve, reject) {
        wellData.expAssay.assayWpAssayPostId = postData.postData.id;
        app.models.ExpAssay.upsert(wellData.expAssay)
            .then(function (results) {
            wellData.expAssay = results;
            resolve(postData);
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.updateExpAssay');
            reject(new Error(error));
        });
    });
};
/**
 * TODO move this to WpTerms - it can be used for ExpPlate and ExpAssay
 * Annotation data gets preprocessed at the end of each plate
 * plateData.annotationData is an array of taxonomy -> termIds relationships
 * In Annotation Data it looks like this
 * {
    "termTaxonomyId": 106,
    "termId": 52,
    "taxonomy": "envira-tag",
    "description": "",
    "parent": 0,
    "count": 1,
    "term": "SI-1_SS-primary_BS-1_TT-empty_W-A12"
  },
 * It gets related to the post in a WpTermRelationshipsResultSet
 {
     termTaxonomyId: termTax.termTaxonomyId,
     termOrder: 0,
     objectId: termTax.postId,
 };
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 * @param {WellCollection} wellData
 */
ExpAssay.load.relateTaxToPost = function (workflowData, screenData, wellData) {
    var results = lodash_1.map(wellData.annotationData.taxTerms, function (taxTerm) {
        return lodash_1.filter(screenData.annotationData.taxTerms, function (taxTermResultSet) {
            return lodash_1.isEqual(String(taxTermResultSet.term), String(taxTerm.taxTerm)) && lodash_1.isEqual(String(taxTermResultSet.taxonomy), String(taxTerm.taxonomy));
        });
    });
    var flat = lodash_1.flatten(results);
    return lodash_1.filter(flat, function (res) {
        return !lodash_1.isEmpty(res);
    });
};
/**
 * This associates the post to the taxonomy terms
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 * @param {PlateCollection} plateData
 * @param {WellCollection} wellData
 * @param postData
 */
ExpAssay.load.workflows.createPostTaxRels = function (workflowData, screenData, wellData, postData) {
    return new Promise(function (resolve, reject) {
        var taxTerms = ExpAssay.load.relateTaxToPost(workflowData, screenData, wellData);
        taxTerms = lodash_1.uniqWith(taxTerms, lodash_1.isEqual);
        // @ts-ignore
        Promise.map(Object.keys(postData), function (postType) {
            return app.models.WpTermRelationships.load
                .createRelationships(postData[postType].id, taxTerms);
        })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            app.winston.error('Error in ExpAssay.load.PostTaxRels');
            app.winston.error(error);
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=ExpAssay.js.map