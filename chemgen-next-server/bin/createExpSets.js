#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('../server/server');
// import {WorkflowModel} from "../../common/models";
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var path = require('path');
var fs = require('fs');
var search = {
    and: [{
            screenId: 9
        }]
};
var plateDataList;
var expGroups = [];
plateDataList.map(function (plateData) {
    plateData.wellDataList.map(function (wellData) {
        expGroups.push(wellData.expGroup);
    });
});
function getExpGroups() {
    return new Promise(function (resolve, reject) {
        app.models.ExpGroup
            .find({ where: search })
            .then(function (expGroups) {
            var groupExpGroups = lodash_1.groupBy(expGroups, 'expGroupType');
        });
    });
}
//# sourceMappingURL=createExpSets.js.map