'use strict';

module.exports = function(ExpPlate) {
  ExpPlate.helpers = {};
  ExpPlate.load = {};
  ExpPlate.load.workflows = {};
  ExpPlate.extract = {};
  ExpPlate.extract.workflows = {};
  ExpPlate.transform = {};
  ExpPlate.transform.workflows = {};

  ExpPlate.on('attached', function() {
    require('../load/ExpPlate');
  });
};

