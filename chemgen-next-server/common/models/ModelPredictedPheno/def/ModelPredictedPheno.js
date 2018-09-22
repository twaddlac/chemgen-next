'use strict'

module.exports = function (ModelPredictedPheno) {
  ModelPredictedPheno.helpers = {}
  ModelPredictedPheno.helpers.primary = {}
  ModelPredictedPheno.helpers.secondary = {}
  ModelPredictedPheno.load = {}
  ModelPredictedPheno.load.workflows = {}
  ModelPredictedPheno.extract = {}
  ModelPredictedPheno.extract.primary = {}
  ModelPredictedPheno.extract.workflows = {}
  ModelPredictedPheno.transform = {}
  ModelPredictedPheno.transform.workflows = {}

  ModelPredictedPheno.on('attached', function () {
    require('../load/ModelPredictedPheno')
  })
}
