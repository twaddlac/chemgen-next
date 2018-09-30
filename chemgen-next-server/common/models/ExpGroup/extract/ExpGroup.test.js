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
            var expGroup = screenData.plateDataList[0].wellDataList[0].expGroup;
            var results = ExpGroup.extract.getExpGroupFromScreenData(expGroup.expGroupId, screenData);
            assert.deepEqual(shared.convertToJSON(results), shared.convertToJSON(expGroup));
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpGroup.test.js.map