var models = require('./../models');
var surveyService = require('./survey');
var constants = require('../util/constants');
var Bluebird = require('bluebird');

//constants.surveyTypes.session
function sessionSurveyData(surveyData, session) {
  let data;
  try {
    data = {
      sessionId:  session.id,
      surveyId:   surveyData.id,
      enabled:    true
    }
  } catch (e) {
    console.log("123213123123123123123123123213122112", e);
  } finally {
    console.log("data parsed--------------", data);
  }

  return data;
}

function defaultQuestionParams(question) {
  return {
    name: question.name,
    question: question.question,
    answers: question.answers,
    order: question.order,
    audioVideo: question.audioVideo,
    required: question.required,
    isDefault: true
  };
}

function prepareDefaultSurveyData(survey) {
  var array = [];
  for(var i in survey.defaultQuestions) {
    var params = defaultQuestionParams(survey.defaultQuestions[i]);
    array.push(params);
  }

  survey.SurveyQuestions = array;
  survey.description = "";
  survey.thanks = "";

  console.log('=====1231231232112211221aaaaaa', survey);
}

function saveSurvey(surveyData, session) {
  console.log("-----1", surveyData);
  return new Bluebird((resolve, reject) => {
    try {
        let survey = prepareDefaultSurveyData(surveyData);
        return surveyService.createSurveyWithQuestions(surveyData, {id: session.accountId}).then(function(survey) {
          let sessionSurveyForSession = sessionSurveyData(survey, session);
          console.log("asdasdasasdasda-----1");
          return models.SessionSurvey.create(sessionSurveyForSession).then(function(sessionSurvey) {
            console.log("__zxzx?");
            resolve(sessionSurvey);
          }).catch(function(e) {
              console.log("sdasda====asdasda==asdad==asd", e);
          });
        });

      } catch (e) {
        console.log("---a--1", e);
      } finally {

      }
  });
}

function addSessionSurveyOfType(type, session) {
  console.log("-----11");
  return new Bluebird((resolve, reject) => {
    return surveyService.constantsSurvey(type).then(function(surveyData) {
      return saveSurvey(surveyData, session);
    });
  });
}

function addDefaultSessionSurveys(session) {
  console.log("---111---------");
  return new Bluebird((resolve, reject) => {
    return addSessionSurveyOfType(constants.surveyTypes.session, session)/*.then(function() {
      return addSessionSurveyOfType(constants.surveyTypes.session, session);
    })*/.then(function(response) {
      console.log("-----All session surveys clear");
      resolve();
    }).catch(function(error) {
      console.log("-----error", error);
      reject(error);
    });
  });
}

module.exports = {
  addDefaultSessionSurveys: addDefaultSessionSurveys
}
