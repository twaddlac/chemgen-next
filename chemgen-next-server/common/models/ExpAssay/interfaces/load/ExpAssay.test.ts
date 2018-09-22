import app = require('../../../../../server/server.js')

import {PlateResultSet, WpTermTaxonomyResultSet} from "../../../../types/sdk/models";
import {WorkflowModel} from "../../../index";
import {ExpSet, ScreenCollection} from "../../../../types/wellData";
import assert = require('assert');

import * as _ from "lodash";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpAssay = app.models.ExpAssay as (typeof WorkflowModel);

import shared = require('../../../../../test/shared');

const instrumentPlates: PlateResultSet = shared.rnaiData.instrumentPlates;
const workflowData: any = shared.rnaiData.workflowData;
const screenData: ScreenCollection = shared.rnaiData.screenData;

shared.makeMemoryDb();

describe('ExpAssay.interfaces.load primary', function (done) {
  shared.prepareRnai();
  it('ExpAssay.load.workflows.getAssayRelations', function (done) {
    this.timeout(5000);
    // delete workflowData['id'];
    ExpAssay.load.workflows.getAssayRelations(workflowData, screenData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[2])
      .then((results: any) => {
        //Map does not guarantee order, so we need to sort
        results.expDesignList = _.sortBy(results.expDesignList, o => o.expDesignId);
        results.expGroupList = _.sortBy(results.expGroupList, o => o.expGroupId);
        assert.equal(results.expDesignList.length, 3);
        assert.equal(results.expGroupList.length, 4);
        assert.deepEqual(shared.convertToJSON(results), {
          "expDesignList": [
            {
              "expDesignId": 2,
              "treatmentGroupId": 8,
              "controlGroupId": 1
            },
            {
              "expDesignId": 3,
              "treatmentGroupId": 8,
              "controlGroupId": 2
            },
            {
              "expDesignId": 4,
              "treatmentGroupId": 8,
              "controlGroupId": 5
            }
          ],
          "expGroupList": [
            {
              "expGroupId": 1,
              "expGroupType": "ctrl_null",
              "screenId": 1,
              "libraryId": 1,
              "biosampleId": 2,
              "expWorkflowId": 1
            },
            {
              "expGroupId": 2,
              "expGroupType": "ctrl_strain",
              "screenId": 1,
              "libraryId": 1,
              "biosampleId": 2,
              "expWorkflowId": 1
            },
            {
              "expGroupId": 5,
              "expGroupType": "ctrl_rnai",
              "screenId": 1,
              "libraryId": 1,
              "reagentId": 703,
              "biosampleId": 1,
              "well": "A03",
              "expWorkflowId": 1
            },
            {
              "expGroupId": 8,
              "expGroupType": "treat_rnai",
              "screenId": 1,
              "libraryId": 1,
              "reagentId": 703,
              "biosampleId": 1,
              "well": "A03",
              "expWorkflowId": 1
            }
          ]
        });

        let annotationData = ExpAssay.load.mapAssayRelations(workflowData, results);
        assert.deepEqual(shared.convertToJSON(annotationData), {
          "ctrl_null": {
            "expGroupId": 1,
            "expGroupType": "ctrl_null",
            "screenId": 1,
            "libraryId": 1,
            "biosampleId": 2,
            "expWorkflowId": 1
          },
          "ctrl_strain": {
            "expGroupId": 2,
            "expGroupType": "ctrl_strain",
            "screenId": 1,
            "libraryId": 1,
            "biosampleId": 2,
            "expWorkflowId": 1
          },
          "ctrl_rnai": {
            "expGroupId": 5,
            "expGroupType": "ctrl_rnai",
            "screenId": 1,
            "libraryId": 1,
            "reagentId": 703,
            "biosampleId": 1,
            "well": "A03",
            "expWorkflowId": 1
          },
          "treat_rnai": {
            "expGroupId": 8,
            "expGroupType": "treat_rnai",
            "screenId": 1,
            "libraryId": 1,
            "reagentId": 703,
            "biosampleId": 1,
            "well": "A03",
            "expWorkflowId": 1
          }
        });
        done();
      })
      .catch((error) => {
        console.log(JSON.stringify(error.stack));
        done(new Error(error));
      });
  });
  it('ExpAssay.load.relateTaxToPost', function () {
    let sorted = _.sortBy(screenData.plateDataList[4].wellDataList[0].annotationData.taxTerms, ['term']);
    let results = ExpAssay.load.relateTaxToPost(workflowData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[0]);
    assert.equal(results.length, sorted.length);
    assert.equal(results[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(results[0].term, 'C48E7.5');
    assert.equal(sorted[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(sorted[0].taxTerm, 'C48E7.5');
  });
  it('ExpAssay.load.workflows.createPostTaxRels', function (done) {
    let postData = {
      'assayPost': {id: 1},
      'imagePost': {id: 2}
    };
    ExpAssay.load.workflows.createPostTaxRels(workflowData, screenData.plateDataList[4], screenData.plateDataList[4].wellDataList[0], postData)
      .then((results: WpTermTaxonomyResultSet[]) => {
        assert.equal(results.length, 2);
        assert.equal(results[0].length, results[1].length);
        done();
      })
      .catch((error) => {
        if(error.message.match('Duplicate entry for WpTermRelationships.objectId')){
          done();
        }
        else{
          done(new Error(error));
        }
      });
  });
  it('ExpAssay.load.workflows.createExpAssayInterface', function (done) {
    app.models.WpTerms.load.workflows.createAnnotationData(workflowData, screenData)
      .then((screenData: ScreenCollection) => {
        return ExpAssay.load.workflows
          .createExpAssayInterfaces(workflowData, screenData, screenData.plateDataList[4]);
      })
      .then((results) => {
        done();
      })
      .catch((error) => {
        console.error(error.message);
        // For the in memory model, it has decided that the objectId is a unique key, even though its not
        // LB is annoying about models that don't have a unique key
        if(error.message.match('Duplicate entry for WpTermRelationships.objectId')){
          done();
        }
        else{
          done(new Error(error));
        }
      })
  });
  shared.sharedAfter();
});

describe('ExpAssay.interfaces.load secondary', function () {
  shared.prepareRnai();
  it('ExpAssay.load.relateTaxToPost secondary with gene', function () {
    let sorted = _.sortBy(shared.rnaiData.secondaryScreenData.plateDataList[0].wellDataList[2].annotationData.taxTerms, ['term']);
    let results = ExpAssay.load.relateTaxToPost(shared.rnaiData.secondaryWorkflowData, shared.rnaiData.secondaryScreenData.plateDataList[0], shared.rnaiData.secondaryScreenData.plateDataList[0].wellDataList[2]);
    assert.equal(results[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(results[0].term, 'C01G8.7');
    assert.equal(sorted[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(sorted[0].taxTerm, 'C01G8.7');
  });
  it('ExpAssay.load.relateTaxToPost secondary L4440', function () {
    let sorted = _.sortBy(shared.rnaiData.secondaryScreenData.plateDataList[0].wellDataList[0].annotationData.taxTerms, ['term']);
    let results = ExpAssay.load.relateTaxToPost(shared.rnaiData.secondaryWorkflowData, shared.rnaiData.secondaryScreenData.plateDataList[0], shared.rnaiData.secondaryScreenData.plateDataList[0].wellDataList[0]);
    assert.equal(results[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(results[0].term, 'L4440');
    assert.equal(sorted[0].taxonomy, 'wb_gene_sequence_id');
    assert.equal(sorted[0].taxTerm, 'L4440');
  });
  shared.sharedAfter();
});
