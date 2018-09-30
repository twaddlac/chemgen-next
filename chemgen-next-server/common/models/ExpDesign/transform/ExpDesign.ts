import app = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {ExpDesignResultSet, ExpGroupResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {PlateCollection, WellCollection} from "../../../types/wellData";

import Promise = require('bluebird');
import * as _ from "lodash";
import {find, uniqBy, get, isEqual, uniqWith, isEmpty, has, map} from 'lodash';

const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

/**
 * TODO THIS is REALLY SLOW
 */

/**
 * Here lie a few transformations to go from
 * List of Plates
 *  Each plate has an associated list of wells
 *    Each well has several associated pieces of experimental data - such as the experimental group (treat_rnai, ctrl_rnai, ctrl_null, ctrl_strain)
 *      If applicable (treat_rnai, ctrl_rnai) also the reagentId, which is the main grouping platform
 *  The end of this workflow gives an array of objects, {treatment_group_id: int, control_group_id: int}. A group of treatment_group_ids is an ExpSet
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection[]} plateDataList
 * @returns {any}
 */
ExpDesign.transform.workflows.screenDataToExpSets = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  app.winston.info(`Begin: Group Exp Conditions`);
  let groups = ExpDesign.transform.groupExpConditions(workflowData, plateDataList);
  app.winston.info(`Begin: Create Exp Sets`);
  let matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
  app.winston.info(`Begin: Prepare Exp Designs`);
  return ExpDesign.transform.prepareExpDesign(workflowData, groups, matchedGroups);
  // return expDesignRows;
};

/**
 * Each Experiment Set is a the grouping of conditions marked by workflowData.expDesign
 * For the RNAi its {treat_rnai: ['ctrL_strain', 'ctrl_null', 'ctrl_rnai']}
 * First get a list of uniq expGroups per condition (treat_rnai, ctrl_strain, ctrl_null, ctrl_rnai)
 * {treat_rnai: [expGroup, expGroup], ctrl_strain: [expGroup, expGroup], ctrl_null: [expGroup, expGroup]}
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateCollection[]} plateDataList
 */
ExpDesign.transform.groupExpConditions = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  let groupsData = {};
  map(plateDataList, (plateData: PlateCollection) => {
    return map(plateData.wellDataList, (wellData) => {
      if (!isEmpty(wellData.expGroup.expGroupType)) {
        if (!has(groupsData, wellData.expGroup.expGroupType)) {
          groupsData[wellData.expGroup.expGroupType] = [];
        }
        groupsData[wellData.expGroup.expGroupType].push(wellData.expGroup);
      }
    });
  });

  map(Object.keys(groupsData), (expGroupType) => {
    groupsData[expGroupType] = uniqWith(groupsData[expGroupType], isEqual);
  });
  return groupsData;
};

/**
 * Get the biosampleControlConditions keys, which have the treatments that have 'stuff' (rnai, chemical)
 * The other conditions are L4440/DMSO that have no stuff
 * Return a list of matched experimental conditions where matches have the same reagentID
 * [{expGroup: {}, ctrlGroup: {}]
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param groupsData
 */
ExpDesign.transform.createExpSets = function (workflowData: ExpScreenUploadWorkflowResultSet, groupsData: any) {
  let exp = Object.keys(workflowData.experimentMatchConditions)[0];
  let control = workflowData.experimentMatchConditions[exp];

  // TODO
  // reagentId should have never been in expGroup to begin with
  // Its in the expAssay2reagent
  // Group by that
  // BUT, assuming the uploads are correct, and a batch is a single batch, just grouping by well is OKxpGroupResultSet
  if (get(groupsData, exp)) {
    return groupsData[exp].map((expGroup: ExpGroupResultSet) => {
      // let reagentId = expGroup.reagentId;
      let well = expGroup.well;
      // Does this one blow up the expDesign Table?
      let controlGroup: any = find(groupsData[control], {well: well});
      return {expGroup: expGroup, controlGroup: controlGroup};
    });
  }
  else {
    return [];
  }
};

ExpDesign.transform.prepareExpDesign = function (workflowData: ExpScreenUploadWorkflowResultSet, groups: any, matchedExpGroups: any) {

  // TODO Get the controlGroupReagentType
  let expDesignRows: ExpDesignResultSet[] = [];
  map(matchedExpGroups, (matchedExpGroup) => {
    //Some of the very early screens do not have matched N2s. I do not know whyyyyyyy
    if(get(matchedExpGroup, 'controlGroup')){
      const controlGroupExpId = matchedExpGroup.controlGroup.expGroupId;
      const controlGroupReagentType = matchedExpGroup.controlGroup.expGroupType;
      if(controlGroupReagentType && controlGroupReagentType){
        expDesignRows.push(new ExpDesignResultSet({
          treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
          controlGroupId: controlGroupExpId,
          expWorkflowId: workflowData.id,
          screenId: workflowData.screenId,
          controlGroupReagentType: controlGroupReagentType,
        }));
      }
    }
    map(workflowData.controlConditions, (condition) => {
      map(groups[condition], (group: ExpGroupResultSet) => {
        expDesignRows.push(new ExpDesignResultSet({
          treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
          screenId: workflowData.screenId,
          expWorkflowId: workflowData.id,
          controlGroupId: group.expGroupId,
          controlGroupReagentType: group.expGroupType,
        }));

      });
    });
  });
  expDesignRows = uniqWith(expDesignRows, isEqual);

  return expDesignRows;
};
