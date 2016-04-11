'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("./util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var mailFixture = require('./../test/fixtures/mailTemplates');
mailFixture.createMailTemplate().then(function(result){
  process.exit();
});
