import app  = require('../../../../server/server.js');

import {WorkflowModel} from "../../index";
import {WpTermTaxonomyResultSet} from "../../../types/sdk/models";
import Promise = require('bluebird');
import {shuffle} from 'lodash';

const WpTermRelationships = app.models['WpTermRelationships'] as (typeof WorkflowModel);

/**
 * Given a postId and a list of WpTermTaxonomyResultSets, relate each post back its taxonomies
 * @param postId
 * @param taxTermObjList
 */
WpTermRelationships.load.createRelationships = function (postId, taxTermObjList: WpTermTaxonomyResultSet[]) {
  taxTermObjList = shuffle(taxTermObjList);
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(taxTermObjList, (taxTermObj) => {
      let createObj = {
        termTaxonomyId: taxTermObj.termTaxonomyId,
        termOrder: 0,
        objectId: postId,
      };
      return WpTermRelationships
        .findOrCreate({
          where: app.etlWorkflow.helpers.findOrCreateObj(createObj)
        }, createObj)
        .then((results) => {
          resolve(results[0]);
        })
        .catch((error) => {
          if (error.message.match('Duplicate')) {
            resolve(createObj);
          }
          else {
            reject(new Error(error));
          }
        });
    }, {concurrency: 6})
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

