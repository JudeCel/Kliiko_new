'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;

var surveyServices = require('./../services/survey');
var async = require('async');

function surveyParams() {
  return {
    name: 'Sample survey',
    SurveyQuestions: [
      surveyQuestionParams(1),
      surveyQuestionParams(2)
    ]
  };
}

function surveyQuestionParams(random) {
  return {
    order: random,
    name: 'Some default name ' + random,
    question: 'What a default question ' + random,
    answers: JSON.stringify({
      0: '0 answer ' + random,
      1: '1 answer ' + random,
      2: '2 answer ' + random,
      3: '3 answer ' + random
    })
  };
}

AccountUser.find({ where: { role: 'accountManager' } }).then(function(accountUser) {
  if(accountUser) {
    let params = surveyParams();
    params.accountId = accountUser.AccountId;

    surveyServices.createSurveyWithQuestions(params).then(function(survey) {
      console.log('Survey created!');
      process.exit();
    }, function(error) {
      console.log('Survey creation failed:');
      console.log(error);
      process.exit();
    });
  }
  else {
    console.log('AccountManager not found!');
    process.exit();
  }
})
