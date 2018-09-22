"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var _ = require("lodash");
var ExpGroup = app.models['ExpGroup'];
/**
 * Given the ScreenData returned by the ExpScreen..populateExperimentData
 * Get a specific ExpGroup
 * @param {number} expGroupId
 * @param {ScreenCollection} screenData
 * @returns {ExpGroupResultSet} object
 */
ExpGroup.extract.getExpGroupFromScreenData = function (expGroupId, screenData) {
    var expGroups = [];
    _.map(screenData.plateDataList, function (plateData) {
        _.map(plateData.wellDataList, function (wellData) {
            if (_.isEqual(wellData.expGroup.expGroupId, expGroupId)) {
                expGroups.push(wellData.expGroup);
            }
        });
    });
    return _.uniqBy(expGroups, 'expGroupId')[0];
};
//# sourceMappingURL=ExpGroup.js.map