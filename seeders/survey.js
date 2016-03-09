'use strict';

var survey = require('./../test/fixtures/survey');
survey.createSurvey().then(function(result){
  console.log('Survey created!');
  process.exit();
}, function(error) {
  console.log('Survey creation failed:');
  console.log(error);
  process.exit();
});
