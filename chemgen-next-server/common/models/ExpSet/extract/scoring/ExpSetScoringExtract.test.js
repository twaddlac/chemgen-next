"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpSetTypes_1 = require("../../../../types/custom/ExpSetTypes");
var assert = require("assert");
var app = require("../../../../../server/server");
var lodash_1 = require("lodash");
if (!lodash_1.isEqual(process.env.NODE_ENV, 'dev')) {
    process.exit(0);
}
describe('ExpSetScoringExtract.test.ts', function () {
    it('Should return the query for exp_assays', function () {
        var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String('ABCDEFG')] });
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQuery(data, search, false);
        var sqlString = sqlQuery.toString();
        var matchedSql = "select * from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
        assert.equal(matchedSql, sqlString);
    });
    it('Should return the query for exp_assay2reagents by exp_workflow_id', function () {
        var search = new ExpSetTypes_1.ExpSetSearch({ expWorkflowSearch: [String('ABCDEFG')] });
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
        var sqlString = sqlQuery.toString();
        var matchedSql = "select distinct `exp_workflow_id` from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
        assert.equal(matchedSql, sqlString);
    });
    it('Should return the query for getting scores with a FIRST_PASS and does no HAS_MANUAL_SCORE', function () {
        // let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
        var search = new ExpSetTypes_1.ExpSetSearch({});
        var data = new ExpSetTypes_1.ExpSetSearchResults({});
        var sqlQuery = app.models.ExpSet.extract.buildNativeQueryByFirstPass(data, search, true);
        var sqlString = sqlQuery.toString();
        assert.ok(sqlString);
    });
});
//# sourceMappingURL=ExpSetScoringExtract.test.js.map