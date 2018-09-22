import app  = require('../../../../server/server.js');
import Promise = require('bluebird');

import {isArray, isObject, get} from 'lodash';
import {WorkflowModel} from "../../index";
import {ExpManualScoresResultSet} from "../../../types/sdk/models";

const ExpManualScores = app.models.ExpManualScores as (typeof WorkflowModel);

ExpManualScores.load.submitScores = function (scores) {
  console.log(JSON.stringify(scores));
  return new Promise((resolve, reject) => {
    if (isArray(scores)) {
      Promise.map(scores, (score: ExpManualScoresResultSet) => {
        if (get(score, 'timestamp')) {
          delete score.timestamp;
        }
        let createObj = app.etlWorkflow.helpers.findOrCreateObj(score);

        let dateNow = new Date();
        score.timestamp = dateNow;

        return ExpManualScores
          .findOrCreate({where: createObj}, score)
          .then((results) => {
            return results[0];
          })
          .catch((error) => {
            app.winston.error(error);
            return new Error(error);
          })
      })
        .then((results) => {
          resolve(results);
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        });
    } else if (isObject(scores)) {
      if (get(scores, 'timestamp')) {
        delete scores.timestamp;
      }
      let createObj = app.etlWorkflow.helpers.findOrCreateObj(scores);
      ExpManualScores
        .findOrCreate({where: createObj}, scores)
        .then((results) => {
          resolve(results[0]);
        })
        .catch((error) => {
          app.winston.error(error);
          reject(new Error(error));
        })
    } else {
      resolve([]);
    }
  });
};

