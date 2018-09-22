'use strict'

module.exports = function (ExpDesign) {
  ExpDesign.helpers = {}
  ExpDesign.load = {}
  ExpDesign.load.primary = {}
  ExpDesign.load.secondary = {}
  ExpDesign.load.workflows = {}
  ExpDesign.extract = {}
  ExpDesign.extract.workflows = {}
  ExpDesign.transform = {}
  ExpDesign.transform.workflows = {}


  ExpDesign.on('attached', function () {
    require('../load/ExpDesign')
    require('../transform/ExpDesign')
    require('../extract/ExpDesign')
  })

  ExpDesign.getExpSets = function (search) {
    return new Promise((resolve, reject) => {
      if(search instanceof Object){
        search = [search];
      }
      ExpDesign.extract.workflows.getExpSets(search)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(new Error(error))
        })
    })
  }

  ExpDesign.remoteMethod(
    'getExpSets', {
      http: {path: '/getExpSets', verb: 'post'},
      accepts: {arg: 'search', type: 'any', http: {source: 'query'}},
      returns: {arg: 'results', type: 'any'}
    }
  )

}
