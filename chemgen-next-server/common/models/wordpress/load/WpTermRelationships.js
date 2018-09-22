"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var WpTermRelationships = app.models['WpTermRelationships'];
/**
 * Given a postId and a list of WpTermTaxonomyResultSets, relate each post back its taxonomies
 * @param postId
 * @param {WpTermTaxonomyResult} taxTermObj
 */
WpTermRelationships.load.createRelationships = function (postId, taxTermObjList) {
    taxTermObjList = lodash_1.shuffle(taxTermObjList);
    return new Promise(function (resolve, reject) {
        Promise.map(taxTermObjList, function (taxTermObj) {
            var createObj = {
                termTaxonomyId: taxTermObj.termTaxonomyId,
                termOrder: 0,
                objectId: postId,
            };
            return WpTermRelationships
                .findOrCreate({
                where: app.etlWorkflow.helpers.findOrCreateObj(createObj)
            }, createObj)
                .then(function (results) {
                resolve(results[0]);
            })
                .catch(function (error) {
                if (error.message.match('Duplicate')) {
                    resolve(createObj);
                }
                else {
                    reject(new Error(error));
                }
            });
        }, { concurrency: 6 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=WpTermRelationships.js.map