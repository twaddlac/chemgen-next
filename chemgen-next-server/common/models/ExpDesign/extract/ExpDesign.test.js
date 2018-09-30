"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server");
var assert = require("assert");
var _ = require("lodash");
var ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow;
var ExpDesign = app.models.ExpDesign;
var instrumentPlates = require('../../../../test/data/rnai_instrument_plate_data_list.json');
var workflowData = require('../../../../test/data/rnai_workflow_data.json');
workflowData.id = 1;
//@ts-ignore
var expDesignResults = [
    {
        "expDesignId": 1,
        "treatmentGroupId": 6,
        "controlGroupId": 3
    },
    {
        "expDesignId": 2,
        "treatmentGroupId": 6,
        "controlGroupId": 2
    },
    {
        "expDesignId": 3,
        "treatmentGroupId": 6,
        "controlGroupId": 1
    },
    {
        "expDesignId": 4,
        "treatmentGroupId": 7,
        "controlGroupId": 4
    },
    {
        "expDesignId": 5,
        "treatmentGroupId": 7,
        "controlGroupId": 2
    },
    {
        "expDesignId": 6,
        "treatmentGroupId": 7,
        "controlGroupId": 1
    },
    {
        "expDesignId": 7,
        "treatmentGroupId": 8,
        "controlGroupId": 5
    },
    {
        "expDesignId": 8,
        "treatmentGroupId": 8,
        "controlGroupId": 2
    },
    {
        "expDesignId": 9,
        "treatmentGroupId": 8,
        "controlGroupId": 1
    }
];
var shared = require("../../../../test/shared");
shared.makeMemoryDb();
describe('ExpDesign.extract', function () {
    shared.prepareRnai();
    it('ExpDesign.extract.workflows.getExpSetByExpGroupIdDB', function (done) {
        this.timeout(5000);
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            var expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
            return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows);
        })
            .then(function () {
            return ExpDesign.extract.workflows.getExpSetByExpGroupId(1);
        })
            .then(function (results) {
            assert.equal(results.length, 3);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpDesign.extract.workflows.getExpSetByExpGroupIdMem', function (done) {
        this.timeout(5000);
        ExpDesign.extract.workflows.getExpSetByExpGroupId(6, expDesignResults)
            .then(function (results) {
            assert.equal(results.length, 3);
            assert.deepEqual(shared.convertToJSON(results[0]), {
                "expDesignId": 1,
                "treatmentGroupId": 6,
                "controlGroupId": 3
            });
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    it('ExpDesign.extract.workflows.getExpGroup', function (done) {
        this.timeout(5000);
        ExpScreenUploadWorkflow.load.workflows.worms.primary.populatePlateData(workflowData, instrumentPlates)
            .then(function (results) {
            var expDesignRows = ExpDesign.transform.workflows.screenDataToExpSets(workflowData, results);
            return ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows);
        })
            .then(function (results) {
            return ExpDesign.extract.workflows.getExpGroup(results);
        })
            .then(function (results) {
            assert.equal(results.expGroupList.length, 8);
            var sortedResults = _.sortBy(results.expGroupList, 'expGroupId');
            assert.equal(sortedResults[0].expGroupType, 'treat_rnai');
            assert.equal(sortedResults[0].expGroupId, 1);
            assert.equal(sortedResults[0].biosampleId, 1);
            done();
        })
            .catch(function (error) {
            done(new Error(error));
        });
    });
    shared.sharedAfter();
});
//# sourceMappingURL=ExpDesign.test.js.map