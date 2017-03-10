var models = require('./../models');
var surveyService = require('./survey');
var constants = require('../util/constants');
var Bluebird = require('bluebird');
var _ = require('lodash');

function isSurveyAttached(sessionId, surveyId) {
  return new Bluebird((resolve, reject) => {
    models.SessionSurvey.find({where: { SurveyId: surveyId, SessionId: sessionId} })
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
      SessionId:  sessionId,
      SurveyId:   surveyId,
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
      models.SessionSurvey.update(data, {where: { SurveyId: surveyId, SessionId: sessionId} })
      .then(function(result) {
        resolve();
      }).catch(function(e) {
        reject(e);
      });
  });
}

function sessionSurveys(sessionId) {
  return new Bluebird((resolve, reject) => {
    models.Session.findOne({
        where: { id: sessionId},
    })
    .then((session) => {
        let items = [];
        if (session) {
          session.getSurveys({joinTableAttributes:['active']}).then(function(result) {
            items = result.map((item) => {
              return {
                surveyId: item.id,
                active: item.SessionSurvey.active,
                surveyType: item.surveyType
              }
            });
            resolve(items);
          });
        } else {
          resolve(items);
        }
    }).catch(function(e) {
      reject(e);
    });
  });
}

function removeSurveys(sessionId) {
  return new Bluebird((resolve, reject) => {

    models.Session.findOne({
        where: { id: sessionId},
    })
    .then((session) => {
      if (session) {
        return session.getSurveys({attributes: ['id']});
      } else {
        resolve();
      }
    })
    .then((surveys) => {
      let ids = _.map(surveys, 'id');
      return models.Survey.destroy({
        where: {
          id: { $in: ids }
        }
      });
    })
    .then(() => {
      resolve();
    })
    .catch(()=> {
      reject();
    });
  });
}

module.exports = {
  addSurveyToSession: addSurveyToSession,
  sessionSurveys: sessionSurveys,
  setSurveyEnabled: setSurveyEnabled,
  removeSurveys: removeSurveys
}
