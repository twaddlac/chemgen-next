'use strict'

module.exports = function (ChemicalLibrary) {
  ChemicalLibrary.helpers = {}
  ChemicalLibrary.helpers.primary = {}
  ChemicalLibrary.helpers.secondary = {}
  ChemicalLibrary.load = {}
  ChemicalLibrary.load.primary = {}
  ChemicalLibrary.load.secondary = {}
  ChemicalLibrary.load.workflows = {}
  ChemicalLibrary.extract = {}
  ChemicalLibrary.extract.primary = {}
  ChemicalLibrary.extract.secondary = {}
  ChemicalLibrary.extract.workflows = {}
  ChemicalLibrary.transform = {}
  ChemicalLibrary.transform.workflows = {}

  ChemicalLibrary.on('attached', function () {
    require('../load/ChemicalLibrary')
    require('../extract/ChemicalLibrary')
    require('../extract/primary/ChemicalLibrary')
    require('../extract/secondary/ChemicalLibrary')
    require('../helpers/ChemicalLibrary')
  })
}

