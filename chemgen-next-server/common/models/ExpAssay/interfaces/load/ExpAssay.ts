import app  = require('../../../../../server/server.js');

import path = require('path');
import {PlateCollection, WellCollection, ScreenCollection, ExpSet} from "../../../../types/wellData";
import {WorkflowModel} from "../../../index";

import slug = require('slug');
import Promise = require('bluebird');
import Mustache = require('mustache');
import {
  ExpDesignResultSet, ExpPlateResultSet,
  ExpScreenUploadWorkflowResultSet, WpPostsResultSet
} from "../../../../types/sdk/models";
import * as _ from "lodash";

// @ts-ignore
const readFile = Promise.promisify(require('fs').readFile);

const ExpAssay = app.models['ExpAssay'] as (typeof WorkflowModel);

/**
 * Workflows for creating web interfaces for the ExpAssays (Assays are a single well)
 */

/**
 *
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.createExpAssayInterfaces = function (workflowData: any, screenData: ScreenCollection, plateData: PlateCollection) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(plateData.wellDataList, (wellData) => {
      return ExpAssay.load.workflows.getAssayRelations(workflowData, screenData, plateData, wellData)
        .then((expSet: ExpSet) => {
          let annotationData = ExpAssay.load.mapAssayRelations(workflowData, expSet);
          return ExpAssay.load.genHtmlView(workflowData, screenData, plateData, wellData, annotationData);
        })
        .then((postContent: string) => {
          //Create the html and image posts
          return ExpAssay.load.workflows.createWpPosts(workflowData, plateData, wellData, postContent)
        })
        .then((results: any) => {
          //Then associate taxTerms to posts
          return ExpAssay.load.workflows.createPostTaxRels(workflowData, screenData, wellData, results);
        })
        .catch((error) => {
          app.winston.error('Error in ExpAssay.load.createExpAssayInterfaces .map');
          reject(new Error(error));
        })
    })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        app.winston.error('Error in ExpAssay.load.workflows.createExpAssayInterfaces');
        reject(new Error(error));
      });
  });
};

/**
 * For each Assay we need to oet the associated Experiment Data with it (Called the ExpSet)
 * 1. Get Exp Design
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 */
ExpAssay.load.workflows.getAssayRelations = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, plateData: PlateCollection, wellData: WellCollection) {
  return new Promise((resolve, reject) => {
    app.models.ExpDesign.extract.workflows.getExpSetByExpGroupId(wellData.expGroup.expGroupId, screenData.expDesignList)
      .then((expDesignList: ExpDesignResultSet[]) => {
        let expGroups = [];
        if (_.isEmpty(expDesignList)) {
          //Its an empty well
          resolve(null);
        }
        else {
          //The treatmentGroupIds are always the same
          expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesignList[0].treatmentGroupId, screenData));
          _.map(expDesignList, (expDesign) => {
            expGroups.push(app.models.ExpGroup.extract.getExpGroupFromScreenData(expDesign.controlGroupId, screenData));
          });
          let expSet = new ExpSet({expDesignList: expDesignList, expGroupList: expGroups});
          resolve(expSet);
        }
      })
      .catch((error) => {
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
ExpAssay.load.mapAssayRelations = function (workflowData: ExpScreenUploadWorkflowResultSet, expSet: ExpSet) {
  if (_.isEmpty(expSet) || _.isNull(expSet)) {
    return {};
  }
  else {
    let annotationData = _.keyBy(expSet.expGroupList, 'expGroupType');
    return annotationData;
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
ExpAssay.load.genHtmlView = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, plateData: PlateCollection, wellData: WellCollection, annotationData: any) {
  const templateName = `${workflowData.librarycode}-${workflowData.screenStage}.mustache`;
  let templateFile = path.join(path.dirname(__filename), `../../../../../common/views/exp/assay/${workflowData.biosampleType}/${workflowData.libraryModel}/expAssay-${templateName}`);
  let screenType = _.capitalize(workflowData.screenType);
  //TODO Generate WpUrl for Plate
  let table = app.models.WpTerms.load.genTermTable(wellData.annotationData.taxTerms);
  let libraryData = app.models[workflowData.libraryModel].load.genLibraryViewData(workflowData, wellData);
  return new Promise(function (resolve, reject) {
    readFile(templateFile, 'utf8')
      .then((contents) => {
        let assayView = Mustache.render(contents, {
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
ExpAssay.load.workflows.createWpPosts = function (workflowData: ExpScreenUploadWorkflowResultSet, plateData: PlateCollection, wellData: WellCollection, postContent: string) {
  return new Promise((resolve, reject) => {
    let plateId = plateData.expPlate.plateId;
    let title = `${plateId}-${wellData.expAssay.assayCodeName}`;
    let assayImagePath = wellData.expAssay.assayImagePath || `${plateData.expPlate.plateImagePath}/${plateData.expPlate.barcode}_${wellData.stockLibraryData.well}`;

    let postData = {
      viewType: workflowData.assayViewType,
      title: title,
      titleSlug: slug(title),
      postContent: postContent,
      postExcerpt: '',
      imagePath: `${assayImagePath}-autolevel.jpeg`,
    };

    app.models.WpPosts.load.workflows.createPost(workflowData, postData)
      .then((result: WpPostsResultSet) => {
        //genImagePost resolves both the assayPost and the imagePost
        //Need to associate tax terms to each of them
        return app.models.WpPosts.load.workflows.genImagePost(result, postData);
      })
      .then((postData: any) => {
        return ExpAssay.load.updateExpAssay(wellData, postData);
      })
      .then((postData: any) => {
        resolve(postData);
      })
      .catch((error) => {
        app.winston.error('Error in ExpAssay.load.workflows.createWpPosts');
        reject(new Error(error));
      })
  });
};

/**
 * Once we have the created the expAssay interface, update the ResultSet with the post Id
 * @param {WellCollection} wellData
 * @param postData
 */
ExpAssay.load.updateExpAssay = function (wellData: WellCollection, postData: any) {
  return new Promise((resolve, reject) => {
    wellData.expAssay.assayWpAssayPostId = postData.postData.id;
    app.models.ExpAssay.upsert(wellData.expAssay)
      .then((results) => {
        wellData.expAssay = results;
        resolve(postData);
      })
      .catch((error) => {
        app.winston.error('Error in ExpAssay.load.updateExpAssay');
        reject(new Error(error));
      })
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
 * @param {PlateCollection} plateData
 * @param {WellCollection} wellData
 * @param postsResults
 */
ExpAssay.load.relateTaxToPost = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, wellData: WellCollection) {
  let results = _.map(wellData.annotationData.taxTerms, (taxTerm) => {
    return _.filter(screenData.annotationData.taxTerms, (taxTermResultSet) => {
      return _.isEqual(String(taxTermResultSet.term), String(taxTerm.taxTerm)) && _.isEqual(String(taxTermResultSet.taxonomy), String(taxTerm.taxonomy));
    });
  });
  let flat = _.flatten(results);
  return _.filter(flat, (res) => {
    return !_.isEmpty(res);
  });
};

/**
 * This associates the post to the taxonomy terms
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection} plateData
 * @param {WellCollection} wellData
 * @param postData
 */
ExpAssay.load.workflows.createPostTaxRels = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection, wellData: WellCollection, postData: any) {
  return new Promise((resolve, reject) => {
    let taxTerms = ExpAssay.load.relateTaxToPost(workflowData, screenData, wellData);
    taxTerms = _.uniqWith(taxTerms, _.isEqual);
    // @ts-ignore
    Promise.map(Object.keys(postData), (postType: string) => {
      return app.models.WpTermRelationships.load
        .createRelationships(postData[postType].id, taxTerms);
    })
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        app.winston.error('Error in ExpAssay.load.PostTaxRels');
        app.winston.error(error);
        reject(new Error(error));
      });

  });
};
