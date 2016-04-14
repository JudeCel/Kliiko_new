'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("../util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var sessionFixture = require('./../test/fixtures/session');
sessionFixture.createChat().then(function(result) {
  console.log('Session created!');
  process.exit();
}, function(error) {
  console.log("Error: " + error);
  process.exit();
});
