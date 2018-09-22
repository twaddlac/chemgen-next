"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpGroup = app.models.ExpGroup;
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ExpGroup.extract', function () {
    shared.prepareRnai();
    it('ExpGroup.extract.getGroupsFromScreenData', function (done) {
        this.timeout(5000);
        delete workflowData.id;
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
            .then(function (screenData) {
            var results = ExpGroup.extract.getExpGroupFromScreenData(6, screenData);
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
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpGroup.test.js.map