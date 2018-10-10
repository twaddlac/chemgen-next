"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../../../../server/server.js");
var lodash_1 = require("lodash");
var assert = require("assert");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var instrumentPlates = require('../../../../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../../../../test/data/rnai_workflow_data.json');
var screenData = require('../../../../../../../test/data/rnai_primary_results_screen_data.json');
var shared = require("../../../../../../../test/shared");
shared.makeMemoryDb();
describe('ExpScreenUploadWorkflow.worms.primary', function () {
    shared.prepareRnai();
    it('ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData - Create the Things', function (done) {
        this.timeout(5000);
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            assert.equal(results.length, 8);
            // contactSheetResults = orderBy(contactSheetResults, 'instrumentPlateId');
            var expPlates = results.map(function (result) {
                return result.expPlate;
            });
            expPlates = lodash_1.orderBy(expPlates, 'instrumentPlateId');
            assert.equal(expPlates[0].barcode, 'L4440E');
            assert.equal(expPlates[0].instrumentPlateId, 9277);
            assert.equal(expPlates[0].plateId, 1);
            assert.equal(results[0].hasOwnProperty('wellDataList'), true);
            assert.equal(results[0].hasOwnProperty('expPlate'), true);
            assert.equal(results[0].wellDataList[0].hasOwnProperty('annotationData'), true);
            assert.equal(results[0].wellDataList[0].hasOwnProperty('expAssay'), true);
            assert.equal(results[0].wellDataList[0].hasOwnProperty('parentLibraryData'), true);
            assert.equal(results[0].wellDataList[0].hasOwnProperty('stockLibraryData'), true);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData - Create Relationships between things', function (done) {
        this.timeout(5000);
        //TODO This should not be set - figure out how/why it is set
        delete workflowData.id;
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExperimentData(workflowData, instrumentPlates)
            .then(function (results) {
            assert.equal(results.expDesignList.length, 9);
            assert.equal(results.plateDataList.length, 8);
            var treatmentId = results.expDesignList[0].treatmentGroupId;
            var countTreatment = lodash_1.filter(results.expDesignList, function (expDesign) {
                return lodash_1.isEqual(expDesign.treatmentGroupId, treatmentId);
            }).length;
            assert.equal(countTreatment, 3);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpScreenUploadWorkflow.load.workflows.worms.primary.createExpInterfaces', function (done) {
        this.timeout(30000);
        delete workflowData.id;
        ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData)
            .then(function (results) {
            assert.equal(workflowData.biosamples.ctrlBiosample.name, 'N2');
            assert.equal(workflowData.biosamples.experimentBiosample.name, 'mel-28');
            assert.equal(results.hasOwnProperty('annotationData'), true);
            assert.equal(results.hasOwnProperty('expDesignList'), true);
            assert.equal(results.hasOwnProperty('plateDataList'), true);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpScreenUploadWorkflow.test.js.map