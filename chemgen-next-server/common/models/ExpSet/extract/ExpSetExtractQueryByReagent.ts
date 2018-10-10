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
