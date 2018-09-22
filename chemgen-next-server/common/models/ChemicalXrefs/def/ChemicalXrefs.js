'use strict'

module.exports = function (ChemicalXrefs) {
  ChemicalXrefs.helpers = {}
  ChemicalXrefs.load = {}
  ChemicalXrefs.load.workflows = {}
  ChemicalXrefs.extract = {}
  ChemicalXrefs.extract.workflows = {}
  ChemicalXrefs.transform = {}
  ChemicalXrefs.transform.workflows = {}

  ChemicalXrefs.on('attached', function () {
    require('../extract/ChemicalXrefs')
  })
}

