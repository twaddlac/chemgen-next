'use strict'

module.exports = function (RnaiLibrary) {
  RnaiLibrary.helpers = {}
  RnaiLibrary.helpers.primary = {}
  RnaiLibrary.helpers.secondary = {}
  RnaiLibrary.load = {}
  RnaiLibrary.load.primary = {}
  RnaiLibrary.load.secondary = {}
  RnaiLibrary.load.workflows = {}
  RnaiLibrary.extract = {}
  RnaiLibrary.extract.primary = {}
  RnaiLibrary.extract.secondary = {}
  RnaiLibrary.extract.workflows = {}
  RnaiLibrary.transform = {}
  RnaiLibrary.transform.workflows = {}

  RnaiLibrary.on('attached', function () {
    require('../load/RnaiLibrary')
    require('../extract/RnaiLibrary')
    require('../extract/primary/RnaiLibrary')
    require('../extract/secondary/RnaiLibrary')
    require('../helpers/RnaiLibrary')
  })
}
