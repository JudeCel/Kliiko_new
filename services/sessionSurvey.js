var models = require('./../models');
var constants = require('../util/constants');
var Bluebird = require('bluebird');
var _ = require('lodash');
var surveyService = require('./survey');
var async = require('async');

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
      active:     true
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
    models.Session.findOne({
      where: { id: sessionId },
    }).then((session) => {
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
    getSessionSurveyIds(sessionId).then((list) => {
      if (list && list.length) {
        return models.Survey.destroy({
          where: {
            id: { $in: list }
          }
        });
      } else {
        resolve();
      }
    }).then(() => {
      resolve();
    }).catch(()=> {
      reject();
    });
  });
}

function copySurveysWithIds(ids, accountId, toSessionId) {
  return new Bluebird((resolve, reject) => {
    async.waterfall(ids.map((id) => {
      return function (nextCallback) {
        surveyService.copySurvey({id: id}, {id: accountId}).then((survey) => {
          return addSurveyToSession(toSessionId, survey.data.id);
        }).then(() => {
          nextCallback();
        }).catch((e) => {
          nextCallback(e);
        });
      }
    }), function(error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function copySurveys(fromSessionId, toSessionId, accountId) {
  return new Bluebird((resolve, reject) => {
    models.Session.findOne({
      where: { id: fromSessionId }
    }).then((session) => {
      if (session) {
        return session.getSurveys();
      } else {
        resolve();
      }
    }).then((surveys) => {
      let surveyList = _.map(surveys, 'id');
      if (surveyList.length) {
        return copySurveysWithIds(surveyList, accountId, toSessionId);
      } else {
        resolve();
      }
    }).then(() => {
      resolve();
    }).catch((e) => {
      reject(e);
    });
  });
}

function getSessionSurveyIds(sessionId) {
  return new Bluebird((resolve, reject) => {
    models.Session.findOne({
        where: { id: sessionId}
    }).then((session) => {
      if (session) {
        return session.getSurveys({attributes: ['id']});
      } else {
        resolve([]);
      }
    }).then((surveys) => {
      let ids = _.map(surveys, 'id');
      resolve(ids);
    }).catch((e)=> {
      reject(e);
    });
  });
}

function getSurveyStatsForSession(id, account) {
  return new Bluebird((resolve, reject) => {
    getSessionSurveyIds(id).then((list) => {
      return surveyService.getSurveyListStats(list, account).then((res) => {
        resolve({ list: res});
      }).catch((e) => {
        resolve({ surveyList: e});
      });
    }).catch((e) => {
      reject(e);
    });
  });
}


module.exports = {
  addSurveyToSession: addSurveyToSession,
  sessionSurveys: sessionSurveys,
  setSurveyEnabled: setSurveyEnabled,
  removeSurveys: removeSurveys,
  copySurveys: copySurveys,
  getSurveyStatsForSession: getSurveyStatsForSession
}
