import app = require('../../../../server/server');
import Promise = require('bluebird');
import assert = require('assert');
import loopback = require('loopback');
import {WorkflowModel} from "../../index";
import {PlateResultSet} from "../../../types/sdk/models";
import {PlateCollection} from "../../../types/custom/wellData";

import * as _ from "lodash";
import {filter, sortBy, isEqual} from 'lodash';

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);
const RnaiLibrary = app.models.RnaiLibrary as (typeof WorkflowModel);

const rnaiLibraries = require('../../../../test/data/rnai_library.json');
const primaryInstrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../test/data/rnai_workflow_data.json');

import shared = require('../../../../test/shared');
import {ExpDesignResultSet} from "../../../types/sdk";

shared.makeMemoryDb();

describe('ExpDesign.transform primary', function () {
  shared.prepareRnai();

  it('ExpDesign.transform.prepareExpDesign', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, primaryInstrumentPlates)
      .then((results: PlateCollection[]) => {
        //TODO Add tests to ensure wells with same reagent get grouped separately
        let groups = ExpDesign.transform.groupExpConditions(workflowData, results);
        let matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
        let expDesignRows = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
        expDesignRows = sortBy(expDesignRows, 'treatmentGroupId');

        //TODO Add some more tests here
        assert.equal(groups['ctrl_null'].length, 1);
        assert.equal(groups['ctrl_strain'].length, 1);
        assert.equal(groups['ctrl_rnai'].length, 3);
        assert.equal(groups['treat_rnai'].length, 3);
        assert.equal(matchedGroups.length, 3);
        // assert.deepEqual(expDesignRows[0], {treatmentGroupId: 2, controlGroupId: 5});
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  shared.sharedAfter();
});

describe('ExpDesign.transform secondary', function(){

  shared.prepareRnai();

  it('ExpDesign.transform.prepareExpDesign', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData(shared.rnaiData.secondaryWorkflowData[0], shared.rnaiData.secondaryInstrumentPlates)
      .then((results: PlateCollection[]) => {
        //TODO Add tests to ensure wells with same reagent get grouped separately
        let groups = ExpDesign.transform.groupExpConditions(workflowData, results);
        let matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
        let expDesignRows :ExpDesignResultSet[]  = ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
        expDesignRows = sortBy(expDesignRows, 'treatmentGroupId');

        const treatmentGroupId = expDesignRows[0].treatmentGroupId;
        let firstSetTreatmentRows = filter(expDesignRows, {treatmentGroupId: treatmentGroupId});
        assert.equal(firstSetTreatmentRows.length, 3);
        //There should only be 2 of the rnai conditions because there are only two wells A02,A03 with rnai in them
        // A01,A12 are L4440
        // H11 is empty
        assert.equal(groups['ctrl_null'].length, 1);
        assert.equal(groups['ctrl_strain'].length, 1);
        assert.equal(groups['ctrl_rnai'].length, 2);
        assert.equal(groups['treat_rnai'].length, 2);
        assert.equal(matchedGroups.length, 2);
        // assert.deepEqual(JSON.parse(JSON.stringify(expDesignRows[0])), {treatmentGroupId: 5, controlGroupId: 2});
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  shared.sharedAfter();
});
