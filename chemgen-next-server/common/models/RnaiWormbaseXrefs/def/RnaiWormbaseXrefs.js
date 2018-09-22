'use strict'

module.exports = function (RnaiWormbaseXrefs) {
  RnaiWormbaseXrefs.helpers = {}
  RnaiWormbaseXrefs.load = {}
  RnaiWormbaseXrefs.load.workflows = {}
  RnaiWormbaseXrefs.extract = {}
  RnaiWormbaseXrefs.extract.workflows = {}
  RnaiWormbaseXrefs.transform = {}
  RnaiWormbaseXrefs.transform.workflows = {}

  RnaiWormbaseXrefs.on('attached', function () {
    require('../extract/RnaiWormbaseXrefs')
  })
}
