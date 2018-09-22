'use strict'

module.exports = function (WpTerms) {
  WpTerms.load = {}
  WpTerms.load.workflows = {}

  WpTerms.extract = {}
  WpTerms.extract.workflows = {}

  WpTerms.on('attached', function () {
    require('../load/WpTerms')
  })

}
