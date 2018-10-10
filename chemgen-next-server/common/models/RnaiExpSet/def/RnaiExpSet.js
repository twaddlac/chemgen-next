'use strict'

module.exports = function (RnaiExpSet) {
  RnaiExpSet.helpers = {}
  RnaiExpSet.load = {}
  RnaiExpSet.load.workflows = {}
  RnaiExpSet.extract = {}
  RnaiExpSet.extract.workflows = {}
  RnaiExpSet.transform = {}
  RnaiExpSet.transform.workflows = {}

  RnaiExpSet.on('attached', function () {
    require('../extract/RnaiExpSet')
    // require('../transform/RnaiExpSet')
    // require('../extract/RnaiExpSet')
  })

  RnaiExpSet.getExpSetsByGenesList = function (search, cb) {
    return new Promise((resolve, reject) => {
      RnaiExpSet.extract.workflows.getExpSetsByGeneList(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  RnaiExpSet.getExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      RnaiExpSet.extract.workflows.getExpSets(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  RnaiExpSet.remoteMethod(
    'getExpSetsByGenesList', {
      http: {path: '/getExpSetsByGenesList', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

  RnaiExpSet.remoteMethod(
    'getExpSets', {
      http: {path: '/getExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

}
