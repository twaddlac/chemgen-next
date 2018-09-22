
'use strict';

module.exports = function(ExpManualScores) {
  ExpManualScores.helpers = {}
  ExpManualScores.load = {}
  ExpManualScores.load.workflows = {}
  ExpManualScores.extract = {}
  ExpManualScores.extract.workflows = {}
  ExpManualScores.transform = {}
  ExpManualScores.transform.workflows = {}

  ExpManualScores.on('attached', function () {
    require('../load/ExpManualScores')
    // require('../transform/ExpManualScores')
    // require('../extract/RnaiExpManualScores')
  })
  ExpManualScores.submitScores = function (scores, cb) {
    return new Promise((resolve, reject) => {
      console.log(`Received scores: ${JSON.stringify(scores)}`);
      ExpManualScores.load.submitScores(scores)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }
  ExpManualScores.remoteMethod(
    'submitScores', {
      http: {path: '/submitScores', verb: 'post'},
      accepts: {arg: 'scores', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
}
