#!/usr/bin/env node

import {PlateCollection, WellCollection} from "../common/types/custom/wellData";

const app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
import Promise = require('bluebird');
import {
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet, ExpGroupResultSet, ExpScreenResultSet,
  ModelPredictedCountsResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../common/types/sdk/models";
import {groupBy, range, isEqual, shuffle, filter} from 'lodash';

const path = require('path');
const fs = require('fs');

let search = {
  and: [{
    screenId: 9
  }]
};

let plateDataList: PlateCollection[];

let expGroups = [];
plateDataList.map((plateData: PlateCollection) => {
  plateData.wellDataList.map((wellData: WellCollection) => {
    expGroups.push(wellData.expGroup);
  });
});

function getExpGroups() {
  return new Promise((resolve, reject) => {
    app.models.ExpGroup
      .find({where: search})
      .then((expGroups: ExpGroupResultSet[]) => {
        let groupExpGroups = groupBy(expGroups, 'expGroupType');

      })
  });
}
