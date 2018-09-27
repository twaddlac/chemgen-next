"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var models_1 = require("../../../types/sdk/models");
var lodash_1 = require("lodash");
var ExpDesign = app.models.ExpDesign;
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
ExpDesign.transform.workflows.screenDataToExpSets = function (workflowData, plateDataList) {
    app.winston.info("Begin: Group Exp Conditions");
    var groups = ExpDesign.transform.groupExpConditions(workflowData, plateDataList);
    app.winston.info("Begin: Create Exp Sets");
    var matchedGroups = ExpDesign.transform.createExpSets(workflowData, groups);
    app.winston.info("Begin: Prepare Exp Designs");
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
ExpDesign.transform.groupExpConditions = function (workflowData, plateDataList) {
    var groupsData = {};
    lodash_1.map(plateDataList, function (plateData) {
        return lodash_1.map(plateData.wellDataList, function (wellData) {
            if (!lodash_1.isEmpty(wellData.expGroup.expGroupType)) {
                if (!lodash_1.has(groupsData, wellData.expGroup.expGroupType)) {
                    groupsData[wellData.expGroup.expGroupType] = [];
                }
                groupsData[wellData.expGroup.expGroupType].push(wellData.expGroup);
            }
        });
    });
    lodash_1.map(Object.keys(groupsData), function (expGroupType) {
        groupsData[expGroupType] = lodash_1.uniqWith(groupsData[expGroupType], lodash_1.isEqual);
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
ExpDesign.transform.createExpSets = function (workflowData, groupsData) {
    var exp = Object.keys(workflowData.experimentMatchConditions)[0];
    var control = workflowData.experimentMatchConditions[exp];
    // TODO
    // reagentId should have never been in expGroup to begin with
    // Its in the expAssay2reagent
    // Group by that
    // BUT, assuming the uploads are correct, and a batch is a single batch, just grouping by well is OKxpGroupResultSet
    if (lodash_1.get(groupsData, exp)) {
        return groupsData[exp].map(function (expGroup) {
            // let reagentId = expGroup.reagentId;
            var well = expGroup.well;
            // Does this one blow up the expDesign Table?
            var controlGroup = lodash_1.find(groupsData[control], { well: well });
            return { expGroup: expGroup, controlGroup: controlGroup };
        });
    }
    else {
        return [];
    }
};
ExpDesign.transform.prepareExpDesign = function (workflowData, groups, matchedExpGroups) {
    // TODO Get the controlGroupReagentType
    var expDesignRows = [];
    lodash_1.map(matchedExpGroups, function (matchedExpGroup) {
        //Some of the very early screens do not have matched N2s. I do not know whyyyyyyy
        if (lodash_1.get(matchedExpGroup, 'controlGroup')) {
            var controlGroupExpId = matchedExpGroup.controlGroup.expGroupId;
            var controlGroupReagentType = matchedExpGroup.controlGroup.expGroupType;
            if (controlGroupReagentType && controlGroupReagentType) {
                expDesignRows.push(new models_1.ExpDesignResultSet({
                    treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
                    controlGroupId: controlGroupExpId,
                    expWorkflowId: workflowData.id,
                    screenId: workflowData.screenId,
                    controlGroupReagentType: controlGroupReagentType,
                }));
            }
        }
        lodash_1.map(workflowData.controlConditions, function (condition) {
            lodash_1.map(groups[condition], function (group) {
                expDesignRows.push(new models_1.ExpDesignResultSet({
                    treatmentGroupId: matchedExpGroup.expGroup.expGroupId,
                    screenId: workflowData.screenId,
                    expWorkflowId: workflowData.id,
                    controlGroupId: group.expGroupId,
                    controlGroupReagentType: group.expGroupType,
                }));
            });
        });
    });
    expDesignRows = lodash_1.uniqWith(expDesignRows, lodash_1.isEqual);
    return expDesignRows;
};
//# sourceMappingURL=ExpDesign.js.map