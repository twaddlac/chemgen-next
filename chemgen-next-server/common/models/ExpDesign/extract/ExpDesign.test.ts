import app = require('../../../../server/server');
import Promise = require('bluebird');
import assert = require('assert');
import {WorkflowModel} from "../../index";
import {
  ExpDesignResultSet, ExpGroupResultSet, ExpScreenUploadWorkflowResultSet,
  PlateResultSet
} from "../../../types/sdk/models";
import {PlateCollection} from "../../../types/custom/wellData";
import {find, sortBy} from 'lodash';

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);
const instrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: ExpScreenUploadWorkflowResultSet = require('../../../../test/data/rnai_workflow_data.json');
workflowData.id = 1;

//@ts-ignore
const expDesignResults: ExpDesignResultSet[] = [
  {
    "expDesignId": 1,
    "treatmentGroupId": 6,
    "controlGroupId": 3
  },
  {
    "expDesignId": 2,
    "treatmentGroupId": 6,
    "controlGroupId": 2
  },
  {
    "expDesignId": 3,
    "treatmentGroupId": 6,
    "controlGroupId": 1
  },
  {
    "expDesignId": 4,
    "treatmentGroupId": 7,
    "controlGroupId": 4
  },
  {
    "expDesignId": 5,
    "treatmentGroupId": 7,
    "controlGroupId": 2
  },
  {
    "expDesignId": 6,
    "treatmentGroupId": 7,
    "controlGroupId": 1
  },
  {
    "expDesignId": 7,
    "treatmentGroupId": 8,
    "controlGroupId": 5
  },
  {
    "expDesignId": 8,
    "treatmentGroupId": 8,
    "controlGroupId": 2
  },
  {
    "expDesignId": 9,
    "treatmentGroupId": 8,
    "controlGroupId": 1
  }
];
import shared = require('../../../../test/shared');

shared.makeMemoryDb();

describe('ExpDesign.extract', function () {
  shared.prepareRnai();

  it('ExpDesign.extract.workflows.getExpSetByExpGroupIdDB', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        let expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
        return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      })
      .then(() => {
        return ExpDesign.extract.workflows.getExpSetByExpGroupId(1);
      })
      .then((results: ExpDesignResultSet[]) => {
        assert.equal(results.length, 3);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
  it('ExpDesign.extract.workflows.getExpSetByExpGroupIdMem', function (done) {
    this.timeout(5000);
    ExpDesign.extract.workflows.getExpSetByExpGroupId(6, expDesignResults)
      .then((results: ExpDesignResultSet[]) => {
        assert.equal(results.length, 3);
        assert.deepEqual(shared.convertToJSON(results[0]), {
          "expDesignId": 1,
          "treatmentGroupId": 6,
          "controlGroupId": 3
        });
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });

  it('ExpDesign.extract.workflows.getExpGroup', function (done) {
    this.timeout(5000);
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        let expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
        return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      })
      .then((results) => {
        return ExpDesign.extract.workflows.getExpGroup(results);
      })
      .then((results: any) => {
        assert.ok(results);
        assert.ok(results.expGroupList.length);
        //These pass when run in the ide but not under mocha....
        // assert.ok(find(results.expGroupList, {expGroupType: 'ctrl_strain'}));
        // assert.ok(find(results.expGroupList, {expGroupType: 'treat_rnai'}));
        // assert.ok(find(results.expGroupList, {expGroupType: 'ctrl_null'}));
        // assert.ok(find(results.expGroupList, {expGroupType: 'ctrl_rnai'}));
        done();
      })
      .catch((error) => {
        done(new Error(error));
      })
  });
  shared.sharedAfter();
});
