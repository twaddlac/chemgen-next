'use strict'

module.exports = function (WpTermTaxonomy) {
  WpTermTaxonomy.load = {}
  WpTermTaxonomy.load.workflows = {}

  WpTermTaxonomy.extract = {}
  WpTermTaxonomy.extract.workflows = {}

  WpTermTaxonomy.on('attached', function () {
    require('../load/WpTermTaxonomy')
  })
}
