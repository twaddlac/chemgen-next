import {ExpSetSearch, ExpSetSearchResults} from "../../../../types/custom/ExpSetTypes";
import assert = require('assert');
import app = require('../../../../../server/server');
import Promise = require('bluebird');
import {isEqual, has, uniq} from 'lodash';
import {ExpScreenUploadWorkflowResultSet} from "../../../../types/sdk";

if (!isEqual(process.env.NODE_ENV, 'dev')) {
  process.exit(0);
}

describe('ExpSetScoringExtract.test.ts', function () {
  it('Should return the query for exp_assays', function () {
    let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
    let data = new ExpSetSearchResults({});
    let sqlQuery = app.models.ExpSet.extract.buildNativeQuery(data, search, false);
    let sqlString = sqlQuery.toString();
    let matchedSql = "select * from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)"
    assert.equal(matchedSql, sqlString);
  });
  it('Should return the query for exp_assay2reagents by exp_workflow_id', function () {
    let search = new ExpSetSearch({expWorkflowSearch: [String('ABCDEFG')]});
    let data = new ExpSetSearchResults({});
    let sqlQuery = app.models.ExpSet.extract.buildNativeQueryExpWorkflowId(data, search, false);
    let sqlString = sqlQuery.toString();
    let matchedSql = "select distinct `exp_workflow_id` from `exp_assay2reagent` where `reagent_type` like 'treat%' and `reagent_id` is not null and `exp_workflow_id` in ('ABCDEFG') and not exists (select 1 from `exp_manual_scores` where exp_assay2reagent.assay_id = exp_manual_scores.assay_id)";
    assert.equal(matchedSql, sqlString);
  });
});
