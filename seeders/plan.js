'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("../util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var subscriptionPlans = require('./../test/fixtures/subscriptionPlans');
subscriptionPlans.createPlans().then(function(result){
  console.log('Plans created!');
  process.exit();
}, function(error) {
  console.log('Plans creation failed:');
  console.log(error);
  process.exit();
});
