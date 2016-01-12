'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;

var surveyServices = require('./../services/survey');
var async = require('async');

function surveyParams() {
  return {
    name: 'Sample survey',
    description: 'Sample description',
    SurveyQuestions: [
      surveyQuestionParams(0),
      surveyQuestionParams(1)
    ]
  };
}

function surveyQuestionParams(random) {
  return {
    order: random,
    name: 'Some default name ' + random,
    question: 'What a default question ' + random,
    answers: [
      {
        order: 0,
        type: 'input',
        name: '0 answer ' + random
      },
      {
        order: 1,
        type: 'input',
        name: '1 answer ' + random
      },
      {
        order: 2,
        type: 'input',
        name: '2 answer ' + random
      },
      {
        order: 3,
        type: 'input',
        name: '3 answer ' + random
      }
    ]
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
