'use strict';

var models = require('../../models');
var Account = models.Account;
var surveyServices = require('./../../services/survey');

var q = require('q');

var sampleSurvey = {
  "name":"This is survey!",
  "description":"Welcome to the sample survey, please fill all answers.",
  "thanks": "Thank you for participating in this survey!",
  "closed":false,
  "SurveyQuestions":[
    {
      "name":"Question number 1",
      "type":"radio",
      "question":"Do you like our site?",
      "order":0,
      "answers":[ { "name":"Yes", "order":0 }, { "name":"No", "order":1 } ]
    },
    {
      "name":"Question number 2",
      "type":"radio",
      "question":"How do you describe this survey?",
      "order":1,
      "answers":[ { "name":"Great", "order":0 }, { "name":"Mediocre", "order":1 }, { "name":"Bad", "order":2 } ]
    },
    {
      "name":"Question number 3",
      "type":"textarea",
      "question":"Please, describe what we should improve.",
      "order":2,
      "answers":[ { "name":"", "order":0 } ]
    },
    {
      "name":"Question number 4",
      "type":"radio",
      "question":"What animal do you like best?",
      "order":3,
      "answers":[ { "name":"Cat", "order":0 }, { "name":"Dog", "order":1 }, { "name":"Monkey", "order":2 }, { "name":"Duck", "order":3 } ]
    },
    {
      "name":"Question number 5",
      "type":"radio",
      "question":"What is the most important thing in your life?",
      "order":4,
      "answers":[ { "name":"Health", "order":0 }, { "name":"Family", "order":1 }, { "name":"Career", "order":2 }, { "name":"Friends", "order":3 } ]
    },
    {
      "name":"Question number 6",
      "type":"radio",
      "question":"What is the second most important thing in your life?",
      "order":5,
      "answers":[ { "name":"Car", "order":0 }, { "name":"Jesus", "order":1 }, { "name":"Buda", "order":2 }, { "name":"Woman", "order":3 }, { "name":"Allah", "order":4 } ]
    },
    {
      "name":"Interest",
      "type":"checkbox",
      "question":"Would you be interested sometime in the future in galaxy far far away do another survey?",
      "order":6,
      "answers":[ { "name":"Yes, Luke, for sure.", "order":0 } ]
    },
    {
      "name":"Prize Draw",
      "type":"checkbox",
      "question":"Would you be interested to win a prize?",
      "order":7,
      "answers":[ { "name":"Prize? :O Yes please", "order":0 } ]
    },
    {
      "name":"Contact details",
      "type":"checkbox",
      "question":"Would you like to share you contact details?",
      "order":8,
      "answers":[
        {
          "name":"No problemo, amigo",
          "order":0,
          "contactDetails":[
            { order: 0, "model": "firstName", "name":"First Name", "input":true },
            { order: 1, "model": "lastName", "name":"Last Name", "input":true },
            { order: 2, "model": "gender", "name":"Gender", "select":true, "options":[ "male", "female", "neither" ] },
            { order: 3, "model": "age", "name":"Age", "input":true },
            { order: 4, "model": "email", "name":"Email", "input":true },
            { order: 5, "model": "mobile", "name":"Mobile", "input":true },
            { order: 6, "model": "postalAddress", "name":"Postal Address", "input":true, },
            { order: 7, "model": "country", "name":"Country", "input":true, }
          ]
        }
      ]
    }
  ]
};

function createSurvey(accountName) {
  let name = accountName || 'user';
  let deferred = q.defer();


  Account.find({ where: { name: name } }).then(function(account) {
    if(account) {
      let params = sampleSurvey;

      surveyServices.createSurveyWithQuestions(params, account).then(function(survey) {
        deferred.resolve(survey);
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject("Account not found!");
    }
  })

  return deferred.promise;
}



module.exports = {
  createSurvey: createSurvey
}
