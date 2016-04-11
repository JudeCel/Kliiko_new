'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("./util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var survey = require('./../test/fixtures/survey');
survey.createSurvey().then(function(result){
  console.log('Survey created!');
  process.exit();
}, function(error) {
  console.log('Survey creation failed:');
  console.log(error);
  process.exit();
});
