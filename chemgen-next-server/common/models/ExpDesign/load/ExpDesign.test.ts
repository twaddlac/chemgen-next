import app = require('../../../../server/server');
import assert = require('assert');
import {WorkflowModel} from "../../index";
import {PlateResultSet} from "../../../types/sdk/models";
import {PlateCollection} from "../../../types/wellData";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

const instrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../test/data/rnai_workflow_data.json');

import shared = require('../../../../test/shared');

shared.makeMemoryDb();

describe('ExpDesign.load primary', function () {
  shared.prepareRnai();

  it('ExpDesign.load.workflows.createExpDesigns', function (done) {
    this.timeout(5000);
    //This test fails when run in the test suite
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        let expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
        return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      })
      .then((results) => {
        assert.equal(results.length, 9);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  shared.sharedAfter();
});

//TODO Create a plate plan!!
describe('ExpDesign.load secondary', function () {
  shared.prepareRnai();

  it('ExpDesign.load.workflows.createExpDesigns', function (done) {
    this.timeout(5000);
    //This test fails when run in the test suite
    ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData(shared.rnaiData.secondaryWorkflowData[0], shared.rnaiData.secondaryInstrumentPlates)
      .then((results: PlateCollection[]) => {
        let expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
        return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      })
      .then((results) => {
        assert.equal(results.length, 9);
        // assert.equal(ExpDesign.extract.isTreatmentId(1, results), false);
        // assert.equal(ExpDesign.extract.isTreatmentId(6, results), true);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  shared.sharedAfter();
});
