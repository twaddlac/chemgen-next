"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var WpTermTaxonomy = app.models['WpTermTaxonomy'];
WpTermTaxonomy.load.createTaxTerms = function (taxTermsList) {
    return new Promise(function (resolve, reject) {
        Promise.map(lodash_1.shuffle(taxTermsList), function (taxTermObj) {
            var createObj = {
                termId: taxTermObj.termId,
                //taxTerm from original object
                //Name, not the slug
                term: taxTermObj.name,
                taxonomy: taxTermObj.taxonomy,
                description: '',
                parent: 0,
                count: 1,
            };
            return WpTermTaxonomy
                .findOrCreate({ where: app.etlWorkflow.helpers.findOrCreateObj(createObj) }, createObj)
                .then(function (results) {
                //This is technically not ok
                //The term gets added back in to make it easier to assocate the posts with the terms
                results[0].term = taxTermObj.name;
                return results[0];
            })
                .catch(function (error) {
                return new Error(error);
            });
        }, { concurrency: 1 })
            .then(function (results) {
            resolve(results);
        })
            .catch(function (error) {
            reject(new Error(error));
        });
    });
};
//# sourceMappingURL=WpTermTaxonomy.js.map