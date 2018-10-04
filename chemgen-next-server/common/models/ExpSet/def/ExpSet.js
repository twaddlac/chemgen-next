'use strict';

module.exports = function(ExpSet) {
  ExpSet.helpers = {}
  ExpSet.load = {}
  ExpSet.load.workflows = {}
  ExpSet.extract = {}
  ExpSet.extract.workflows = {}
  ExpSet.transform = {}
  ExpSet.transform.workflows = {}

  ExpSet.on('attached', function () {
    require('../extract/ExpSetExtract')
    require('../extract/scoring/ExpSetScoringExtract')
    require('../extract/scoring/ExpSetScoringExtractByCounts')
    require('../extract/scoring/ExpSetScoringExtractByPlate')
    require('../extract/scoring/ExpSetResults')
  })

  ExpSet.getExpSetsByWorkflowId = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getExpSetsByWorkflowId(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getUnScoredExpSets = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSets(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getUnScoredExpSetsByCounts = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSetsByCounts(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.getUnScoredExpSetsByPlate = function (search, cb) {
    return new Promise((resolve, reject) => {
      ExpSet.extract.workflows.getUnscoredExpSetsByPlate(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpSet.remoteMethod(
    'getExpSetsByWorkflowId', {
      http: {path: '/getExpSetsByWorkflowId', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
  ExpSet.remoteMethod(
    'getUnScoredExpSets', {
      http: {path: '/getUnScoredExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
  ExpSet.remoteMethod(
    'getUnScoredExpSetsByCounts', {
      http: {path: '/getUnScoredExpSetsByCounts', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )
  ExpSet.remoteMethod(
    'getUnScoredExpSetsByPlate', {
      http: {path: '/getUnScoredExpSetsByPlate', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

};
