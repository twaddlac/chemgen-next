'use strict'

module.exports = function (RnaiLibraryStock) {
  RnaiLibraryStock.helpers = {}
  RnaiLibraryStock.load = {}
  RnaiLibraryStock.load.workflows = {}
  RnaiLibraryStock.extract = {}
  RnaiLibraryStock.extract.primary = {}
  RnaiLibraryStock.extract.workflows = {}
  RnaiLibraryStock.transform = {}
  RnaiLibraryStock.transform.workflows = {}

  RnaiLibraryStock.on('attached', function () {
    require('../load/RnaiLibraryStock')
  })
}
