import app = require('../../../../server/server');
import Promise = require('bluebird');
import {PlateCollection, ScreenCollection} from "../../../types/custom/wellData";
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
        let expGroup = screenData.plateDataList[0].wellDataList[0].expGroup;
        let results: any = ExpGroup.extract.getExpGroupFromScreenData(expGroup.expGroupId, screenData);
        assert.deepEqual(shared.convertToJSON(results), shared.convertToJSON(expGroup));
        done();
      })
      .catch((error) =>{
        done(new Error(error));
      });
  });

  shared.sharedAfter();
});
