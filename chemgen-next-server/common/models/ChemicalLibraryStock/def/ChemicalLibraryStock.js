'use strict'

module.exports = function (ChemicalLibraryStock) {
  ChemicalLibraryStock.helpers = {}
  ChemicalLibraryStock.load = {}
  ChemicalLibraryStock.load.workflows = {}
  ChemicalLibraryStock.extract = {}
  ChemicalLibraryStock.extract.primary = {}
  ChemicalLibraryStock.extract.workflows = {}
  ChemicalLibraryStock.transform = {}
  ChemicalLibraryStock.transform.workflows = {}

  ChemicalLibraryStock.on('attached', function () {
    require('../load/ChemicalLibraryStock')
  })
}
