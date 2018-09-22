import app = require('../../../../server/server');
import Promise = require('bluebird');
import path = require('path');
import assert = require('assert');
import jsonfile = require('jsonfile');
import loopback = require('loopback');
import {WorkflowModel} from "../../index";
import {PlateResultSet} from "../../../types/sdk/models";
import {PlateCollection, WellCollection, ScreenCollection} from "../../../types/wellData";

import * as _ from "lodash";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);
const RnaiLibrary = app.models.RnaiLibrary as (typeof WorkflowModel);

const ModelPredictedPheno = app.models.ModelPredictedPheno as (typeof WorkflowModel);

const rnaiLibraries = require('../../../../test/data/rnai_library.json');
const instrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../test/data/rnai_workflow_data.json');
const screenData: ScreenCollection = require('../../../../test/data/rnai_primary_results_screen_data.json');

import shared = require('../../../../test/shared');

shared.makeMemoryDb();


describe('ModelPredictedPheno.load.workflows.parseScreen', function () {
  shared.prepareRnai();

  it('ModelPredictedPheno.load.getPhenos', function (done) {
    this.timeout(30000);
    let wellData = {expAssay: {assayImagePath: '2016Aug22/6813/RNAiI.3A1E_M_H12'}, expAssay2reagent: {reagentId: 1}};
    ModelPredictedPheno.load.getPhenos(workflowData, wellData)
      .then((results) => {
        console.log(JSON.stringify(results, null, 2));
        let response = JSON.parse(results.screenMeta);
        assert.equal(response.hasOwnProperty('top_hits'), true);
        assert.equal(response.hasOwnProperty('request'), true);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  it('ModelPredictedPheno.load.workflows.parseScreens with L4440 Plate', function (done) {
    this.timeout(1000000);
    //Have to reduce this otherwise it will time out
    let smallData = new ScreenCollection({plateDataList: [screenData.plateDataList[3]]});

    ModelPredictedPheno.load.workflows.parseScreen(workflowData, smallData)
      .then((results) => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  it('ModelPredictedPheno.load.workflows.parseScreens with Rnai Plate', function (done) {
    this.timeout(1000000);
    //Have to reduce this otherwise it will time out
    let smallData = new ScreenCollection({plateDataList: [screenData.plateDataList[4]]});

    ModelPredictedPheno.load.workflows.parseScreen(workflowData, smallData)
      .then((results) => {
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });

  shared.sharedAfter();
});
