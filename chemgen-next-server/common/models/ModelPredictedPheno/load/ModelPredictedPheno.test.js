"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var wellData_1 = require("../../../types/wellData");
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
    it('ModelPredictedPheno.load.getPhenos', function (done) {
        this.timeout(30000);
        var wellData = { expAssay: { assayImagePath: '2016Aug22/6813/RNAiI.3A1E_M_H12' }, expAssay2reagent: { reagentId: 1 } };
        ModelPredictedPheno.load.getPhenos(workflowData, wellData)
            .then(function (results) {
            console.log(JSON.stringify(results, null, 2));
            var response = JSON.parse(results.screenMeta);
            assert.equal(response.hasOwnProperty('top_hits'), true);
            assert.equal(response.hasOwnProperty('request'), true);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ModelPredictedPheno.load.workflows.parseScreens with L4440 Plate', function (done) {
        this.timeout(1000000);
        //Have to reduce this otherwise it will time out
        var smallData = new wellData_1.ScreenCollection({ plateDataList: [screenData.plateDataList[3]] });
        ModelPredictedPheno.load.workflows.parseScreen(workflowData, smallData)
            .then(function (results) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ModelPredictedPheno.load.workflows.parseScreens with Rnai Plate', function (done) {
        this.timeout(1000000);
        //Have to reduce this otherwise it will time out
        var smallData = new wellData_1.ScreenCollection({ plateDataList: [screenData.plateDataList[4]] });
        ModelPredictedPheno.load.workflows.parseScreen(workflowData, smallData)
            .then(function (results) {
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ModelPredictedPheno.test.js.map