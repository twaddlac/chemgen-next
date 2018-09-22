'use strict'

module.exports = function (ExpGroup) {
  ExpGroup.helpers = {}
  ExpGroup.load = {}
  ExpGroup.load.primary = {}
  ExpGroup.load.secondary = {}
  ExpGroup.load.workflows = {}
  ExpGroup.extract = {}
  ExpGroup.extract.workflows = {}
  ExpGroup.transform = {}
  ExpGroup.transform.workflows = {}


  ExpGroup.on('attached', function () {
    require('../extract/ExpGroup')
  })
}
