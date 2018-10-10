"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpDesign = app.models.ExpDesign;
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ExpDesign.load primary', function () {
    shared.prepareRnai();
    it('ExpDesign.load.workflows.createExpDesigns', function (done) {
        this.timeout(5000);
        //This test fails when run in the test suite
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            var expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
            return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows);
        })
            .then(function (results) {
            assert.ok(results.length);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
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
            .then(function (results) {
            var expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
            return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows);
        })
            .then(function (results) {
            assert.ok(results.length);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpDesign.test.js.map