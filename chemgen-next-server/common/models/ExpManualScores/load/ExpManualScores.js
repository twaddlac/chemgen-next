"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("../../../../server/server.js");
var Promise = require("bluebird");
var lodash_1 = require("lodash");
var ExpManualScores = app.models.ExpManualScores;
ExpManualScores.load.submitScores = function (scores) {
    console.log(JSON.stringify(scores));
    var dateNow = new Date(Date.now());
    return new Promise(function (resolve, reject) {
        if (lodash_1.isArray(scores)) {
            //@ts-ignore
            Promise.map(scores, function (score) {
                if (lodash_1.get(score, 'timestamp')) {
                    delete score.timestamp;
                }
                var createObj = app.etlWorkflow.helpers.findOrCreateObj(score);
                app.winston.info(JSON.stringify(createObj));
                score.timestamp = dateNow;
                return ExpManualScores
                    .findOrCreate({ where: createObj }, score)
                    .then(function (results) {
                    return results[0];
                })
                    .catch(function (error) {
                    app.winston.error(error);
                    return new Error(error);
                });
            })
                .then(function (results) {
                resolve(results);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
        else if (lodash_1.isObject(scores)) {
            if (lodash_1.get(scores, 'timestamp')) {
                delete scores.timestamp;
            }
            var createObj = app.etlWorkflow.helpers.findOrCreateObj(scores);
            scores.timestamp = dateNow;
            ExpManualScores
                .findOrCreate({ where: createObj }, scores)
                .then(function (results) {
                resolve(results[0]);
            })
                .catch(function (error) {
                app.winston.error(error);
                reject(new Error(error));
            });
        }
        else {
            resolve([]);
        }
    });
};
//# sourceMappingURL=ExpManualScores.js.map