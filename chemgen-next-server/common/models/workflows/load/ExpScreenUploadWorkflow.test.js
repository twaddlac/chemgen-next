"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var app = require("../../../../server/server");
var Promise = require("bluebird");
var ExpScreenUploadWorkflow = app.models['ExpScreenUploadWorkflow'];
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
var expPlates = [
    {
        "plateId": 1,
        "screenId": 1,
        "plateImagePath": "2017Dec18/9281",
        "barcode": "RNAiI.3A1E",
        "instrumentId": 1,
        "screenStage": 1,
        "instrumentPlateId": 9281,
        "plateStartTime": new Date("2017-12-18T15:56:26.000Z"),
        "plateCreationDate": new Date("2017-12-18T00:00:00.000Z")
    },
    {
        "plateId": 2,
        "screenId": 1,
        "plateImagePath": "2017Dec18/9282",
        "barcode": "L4440E",
        "instrumentId": 1,
        "screenStage": 1,
        "instrumentPlateId": 9282,
        "plateStartTime": new Date("2017-12-18T15:56:26.000Z"),
        "plateCreationDate": new Date("2017-12-18T00:00:00.000Z")
    },
    {
        "plateId": 3,
        "screenId": 1,
        "plateImagePath": "2017Dec18/9283",
        "barcode": "RNAiI.3A1E_M",
        "instrumentId": 1,
        "screenStage": 1,
        "instrumentPlateId": 9283,
        "plateStartTime": new Date("2017-12-18T15:56:26.000Z"),
        "plateCreationDate": new Date("2017-12-18T00:00:00.000Z")
    },
    {
        "plateId": 4,
        "screenId": 1,
        "plateImagePath": "2017Dec18/9284",
        "barcode": "L4440E_M",
        "instrumentId": 1,
        "screenStage": 1,
        "instrumentPlateId": 9284,
        "plateStartTime": new Date("2017-12-18T15:56:26.000Z"),
        "plateCreationDate": new Date("2017-12-18T00:00:00.000Z")
    },
    {
        "plateId": 1,
        "screenId": 1,
        "plateImagePath": "2017Dec18/9285",
        "barcode": "RNAiI.3A1E_D",
        "instrumentId": 1,
        "screenStage": 1,
        "instrumentPlateId": 9285,
        "plateStartTime": new Date("2017-12-18T15:56:26.000Z"),
        "plateCreationDate": new Date("2017-12-18T00:00:00.000Z")
    },
];
var workflowData = {
    wells: ['A01', 'A02', 'A03', 'A12'],
    screenId: 1,
    instrumentId: 1,
    libraryId: 1,
    screenName: 'mel-28 Primary RNAi Enhancer Screen',
    assayViewType: 'exp_assay_ahringer2',
    temperature: '25.5C',
    screenStage: 'primary',
    biosamples: { expBiosample: 1, ctrlBiosample: 2 },
    libraryModel: 'RnaiLibrary',
    libraryStockModel: 'RnaiLibraryStock',
    reagentLookUp: 'rnaiId',
    instrumentLookUp: 'arrayScan',
    biosampleType: 'worm',
    stockPrepDate: new Date(),
    search: { rnaiLibrary: { plate: '3', chrom: 'I' } },
    replicates: {
        1: [9281, 9282, 9283, 9284],
        2: [9285],
    },
    conditions: ['treat_rnai', 'ctrl_rnai', 'ctrl_null', 'ctrl_strain'],
    controlConditions: ['ctrl_strain', 'ctrl_null'],
    biosampleControlConditions: {
        'treat_rnai': 'ctrl_strain',
        'ctrl_rnai': 'ctrl_null',
    },
    expDesign: { treat_rnai: ['ctrl_rnai', 'ctrl_strain', 'ctrl_null'] },
    expGroups: {
        treat_rnai: { biosampleId: 1, plates: [expPlates[2]] },
        ctrl_rnai: { biosampleId: 1, plates: [expPlates[0], expPlates[4]] },
        ctrl_strain: { biosampleId: 2, plates: [expPlates[3]] },
        ctrl_null: { biosampleId: 2, plates: [expPlates[1]] },
    }
};
/*
This is the default ExpScreenUpload Workflow
TBA -
AD Worm Rnai Primary
AD Worm Rnai Secondary
AD Worm Chemical Primary
AD Worm Chemical Secondary
 */
describe('ExpScreenUploadWorkflow.load', function () {
    shared.sharedBefore();
    it('ExpScreenUploadWorkflow should be empty', function (done) {
        ExpScreenUploadWorkflow.count()
            .then(function (count) {
            assert.equal(count, 0);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpScreenUploadWorkflow.findOrCreate on deeply nested object', function (done) {
        //This only sort of works. Just flattening the whole thing got me funny contactSheetResults.
        var search = app.models[workflowData.libraryModel].load.createWorkflowSearchObj(workflowData);
        Promise.map([1, 2, 3, 4], function () {
            return ExpScreenUploadWorkflow
                .findOrCreate({
                where: search,
            }, workflowData)
                .then(function (results) {
                return results[0];
            });
        }, { concurrency: 1 })
            .then(function (results) {
            assert.equal(results[0].id, 1);
            assert.equal(results[1].id, 1);
            assert.equal(results[2].id, 1);
            assert.equal(results[3].id, 1);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpScreenUploadWorkflow.findOrCreate on deeply nested object - secondary', function (done) {
        //This only sort of works. Just flattening the whole thing got me funny contactSheetResults.
        //TODO Write tests against the mongodb datastore - this is ridiculous
        var search = app.models[workflowData.libraryModel].load.createWorkflowSearchObj(shared.rnaiData.secondaryWorkflowData[0]);
        Promise.map([1, 2, 3, 4], function () {
            return ExpScreenUploadWorkflow
                .findOrCreate({
                where: search,
            }, shared.rnaiData.secondaryWorkflowData[0])
                .then(function (results) {
                return results[0];
            });
        }, { concurrency: 1 })
            .then(function (results) {
            assert.equal(results[0].id, 1);
            assert.equal(results[1].id, 1);
            assert.equal(results[2].id, 1);
            assert.equal(results[3].id, 1);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpScreenUploadWorkflow.test.js.map