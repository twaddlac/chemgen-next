import app  = require('../../../../server/server.js');

import {WorkflowModel} from "../../index";
import { WpTermsResultSet, WpTermTaxonomyResultSet} from "../../../types/sdk/models";
import Promise = require('bluebird');
import {shuffle} from 'lodash';

const WpTermTaxonomy = app.models['WpTermTaxonomy'] as (typeof WorkflowModel);

WpTermTaxonomy.load.createTaxTerms = function (taxTermsList: WpTermsResultSet[]) {
  return new Promise((resolve, reject) => {
    Promise.map(shuffle(taxTermsList), (taxTermObj) => {
      let createObj = {
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
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(createObj)}, createObj)
        .then((results) => {
          //This is technically not ok
          //The term gets added back in to make it easier to assocate the posts with the terms
          results[0].term = taxTermObj.name;
          return results[0];
        })
        .catch((error) =>{
          return new Error(error);
        });
    }, {concurrency: 1})
      .then((results: WpTermTaxonomyResultSet) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};
