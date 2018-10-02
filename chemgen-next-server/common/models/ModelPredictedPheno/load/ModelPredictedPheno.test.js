"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpDesign = app.models.ExpDesign;
var RnaiLibrary = app.models.RnaiLibrary;
var ModelPredictedPheno = app.models.ModelPredictedPheno;
var rnaiLibraries = require('../../../../test/data/rnai_library.json');
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
var screenData = require('../../../../test/data/rnai_primary_results_screen_data.json');
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ModelPredictedPheno.load.workflows.parseScreen', function () {
    shared.prepareRnai();
    shared.sharedAfter();
});
//# sourceMappingURL=ModelPredictedPheno.test.js.map