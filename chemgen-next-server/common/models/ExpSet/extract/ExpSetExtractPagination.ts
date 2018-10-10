import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet,
  ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet, RnaiLibraryResultSet, RnaiWormbaseXrefsResultSet,
} from "../../../types/sdk/models/index";
import {
  find,
  uniqBy,
  isEqual,
  slice,
  shuffle,
  isEmpty,
  groupBy,
} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../../types/custom/ExpSetTypes/index";

import config = require('config');

//@ts-ignore
const ExpSet = app.models.ExpSet as (typeof WorkflowModel);

/**
 * This only builds the most basic pagination
 * It does not do any filtering for assays that already have scores
 * Or ordering expAssays by any rank
 * To do eithe of these things see ExpSet.extract.workflows.scoring
 * @param {ExpSetSearchResults} data
 * @param {ExpSetSearch} search
 */
ExpSet.extract.buildBasicPaginationData = function (data: ExpSetSearchResults, search: ExpSetSearch) {
  return new Promise((resolve, reject) => {
    let or = app.models.ExpSet.extract.buildQuery(data, search);
    app.paginateModel('ExpAssay2reagent', {or: or}, search.pageSize)
      .then((pagination) => {
        data.currentPage = search.currentPage;
        data.skip = search.skip;
        data.pageSize = search.pageSize;
        data.totalPages = pagination.totalPages;
        resolve(data);
      })
      .catch((error) => {
        app.winston.error(error);
        reject(new Error(error));
      });
  });
};


