import app  = require('../../../../server/server.js');

import {WorkflowModel} from "../../index";

import Promise = require('bluebird');
import * as _ from "lodash";
import {PlateCollection, WellCollection, ScreenCollection} from "../../../types/custom/wellData";
import {ExpGroupResultSet} from "../../../types/sdk/models";

const ExpGroup = app.models['ExpGroup'] as (typeof WorkflowModel);

/**
 * Given the ScreenData returned by the ExpScreen..populateExperimentData
 * Get a specific ExpGroup
 * @param {number} expGroupId
 * @param {ScreenCollection} screenData
 * @returns {ExpGroupResultSet} object
 */
ExpGroup.extract.getExpGroupFromScreenData = function (expGroupId: number, screenData: ScreenCollection) {
  let expGroups = [];
  _.map(screenData.plateDataList, (plateData: PlateCollection) =>{
    _.map(plateData.wellDataList, (wellData: WellCollection)=>{
      if(_.isEqual(wellData.expGroup.expGroupId, expGroupId)){
        expGroups.push(wellData.expGroup);
      }
    });
  });
  return _.uniqBy(expGroups, 'expGroupId')[0];
};

