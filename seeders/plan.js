'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});

var subscriptionPlans = require('./../test/fixtures/subscriptionPlans');
subscriptionPlans.createPlans().then(function(result){
  console.log('Plans created!');
  process.exit();
}, function(error) {
  console.log('Plans creation failed:');
  console.log(error);
  process.exit();
});
