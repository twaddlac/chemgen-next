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

  shared.sharedAfter();
});
