var models = require('./../models');
var surveyService = require('./survey');
var constants = require('../util/constants');
var Bluebird = require('bluebird');

function isSurveyAttached(sessionId, surveyId) {
  return new Bluebird((resolve, reject) => {
    models.SessionSurvey.find({where: { surveyId: surveyId, sessionId: sessionId} })
      .then((result) => {
        if (result) {
          resolve();
        } else {
          reject();
        }
      });
  });
}

function addSurveyToSession(sessionId, surveyId) {
  return new Bluebird((resolve, reject) => {
    let data = {
      sessionId:  sessionId,
      surveyId:   surveyId,
      active:    true
    }
    isSurveyAttached(sessionId, surveyId).then(function() {
      resolve();
    }, function() {
      models.SessionSurvey.create(data).then(function(sessionSurvey) {
        resolve(sessionSurvey);
      }).catch(function(e) {
        reject(e);
      });
    });
  });
}

function setSurveyEnabled(sessionId, surveyId, active) {
  return new Bluebird((resolve, reject) => {
      let data = {active: active};
      models.SessionSurvey.update(data, {where: { surveyId: surveyId, sessionId: sessionId} })
      .then(function(result) {
        resolve();
      }).catch(function(e) {
        reject(e);
      });
  });
}

function sessionSurveys(sessionId) {
  return new Bluebird((resolve, reject) => {
    models.SessionSurvey.findAll({
        where: { sessionId: sessionId},
        include: [{
          model:      models.Survey,
          attributes: ['surveyType']
        }]
      })
      .then((result) => {
        let items = [];
        if (result && result.length) {
          items = result.map((item) => {
            return {
              surveyId: item.surveyId,
              active: item.active,
              surveyType: item.Survey.surveyType
            }
          });
        }
        resolve(items);
      }).catch(function(e) {
        reject(e);
      });
  });
}


module.exports = {
  addSurveyToSession: addSurveyToSession,
  sessionSurveys: sessionSurveys,
  setSurveyEnabled: setSurveyEnabled
}