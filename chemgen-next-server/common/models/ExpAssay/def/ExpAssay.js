'use strict'

module.exports = function (ExpAssay) {
  ExpAssay.helpers = {}
  ExpAssay.load = {}
  ExpAssay.load.primary = {}
  ExpAssay.load.secondary = {}
  ExpAssay.load.workflows = {}
  ExpAssay.extract = {}
  ExpAssay.extract.workflows = {}
  ExpAssay.transform = {}
  ExpAssay.transform.workflows = {}

  //EntryPoint for worm/cell/site/screenStage specific logic
  ExpAssay.load.resolveImagePath = {}
  ExpAssay.load.workflows.imageConversionPipeline = {}

  ExpAssay.on('attached', function () {
    require('../load/ExpAssay')
    require('../helpers/ExpAssay')
    require('../interfaces/load/ExpAssay')
  })
}
