import app = require('../../../../server/server');
import Promise = require('bluebird');
import {PlateCollection, ScreenCollection} from "../../../types/wellData";
import {WorkflowModel} from "../../index";
import {ExpGroupResultSet, PlateResultSet} from "../../../types/sdk/models";

import assert = require('assert');

import * as _ from "lodash";

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);
const ExpGroup = app.models.ExpGroup as (typeof WorkflowModel);

const instrumentPlates: PlateResultSet[] = require('../../../../test/data/rnai_instrument_plate_data_list.json');
const workflowData: any = require('../../../../test/data/rnai_workflow_data.json');

import shared = require('../../../../test/shared');

shared.makeMemoryDb();
describe('ExpGroup.extract', function () {
  shared.prepareRnai();

  it('ExpGroup.extract.getGroupsFromScreenData', function(done){
    this.timeout(5000);
    delete workflowData.id;
    ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
      .then((screenData: ScreenCollection) => {
        let results: any = ExpGroup.extract.getExpGroupFromScreenData(6, screenData);
        assert.deepEqual(shared.convertToJSON(results), {
          "expGroupId": 6,
          "expGroupType": "ctrl_rnai",
          "screenId": 1,
          "libraryId": 1,
          "reagentId": 703,
          "biosampleId": 1,
          "well": "A03",
          "expWorkflowId": 1,
        });
        done();
      })
      .catch((error) =>{
        done(new Error(error));
      });
  });

  shared.sharedAfter();
});
