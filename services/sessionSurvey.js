var models = require('./../models');
var constants = require('../util/constants');
var Bluebird = require('bluebird');
var _ = require('lodash');
var surveyService = require('./survey');
var async = require('async');
var surveyConstants = require('../util/surveyConstants');
const DEFAULT_SURVEY_TEXT = {
    "sessionContactList": {
      "thanks": "Thanks for all your help! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).",
      "description": "Let's keep in touch!"
    },
    "sessionPrizeDraw": {
      "thanks": "Thanks for all your help! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).",
      "description": "Be in the draw to win (prize)!"
    }
  }

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
      sessionId: sessionId,
      surveyId: surveyId,
      active: false
    }
    isSurveyAttached(sessionId, surveyId).then(function() {
      resolve();
    }, function() {
      models.Survey.find({ where: { id: surveyId }, attributes: ["surveyType"] }).then(function(survey) {
        if (survey.surveyType == "sessionContactList") {
          data.active = true;
        }
        return models.SessionSurvey.create(data);
      }).then(function(sessionSurvey) {
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
        resolve({ surveys: res});
      })
    }).catch((e) => {
      reject(e);
    });
  });
}

function assignContactListToSessionSurveys(clId, sessionId) {
  return new Bluebird((resolve, reject) => {
    getSessionSurveyIds(sessionId).then((list) => {
      models.Survey.update({contactListId: clId}, {where: { id: { $in: list }} }).then(function(result) {
        resolve();
      }, function (error) {
        reject(error);
      }).catch((e) => {
        reject(e);
      });
    }).catch((e) => {
      reject(e);
    });
  });
}

function prepareSessionQuestions(surveyData, sessionId, accountId, sType) {
  return new Bluebird((resolve, reject) => {
    surveyData.name = 'name' + sessionId;
    surveyData.thanks = DEFAULT_SURVEY_TEXT[sType].thanks;
    surveyData.description = DEFAULT_SURVEY_TEXT[sType].description;
    surveyData.surveyType = sType;

    surveyData.SurveyQuestions = surveyData.defaultQuestions.map((question) => {
      return !question.contact;
    });

    surveyService.createSurveyWithQuestions(surveyData, {id: accountId}).then((response) => {
      return addSurveyToSession(sessionId, response.data.id);
    }).then(() => {
      resolve();
    }).catch((e) => {
      reject(e);
    })
  });
}

function createDefaultSessionSurveys(sessionId, accountId) {
  return new Bluebird((resolve, reject) => {
    let sessionContactList = surveyConstants.getSurveyConstants(constants.surveyTypes.sessionContactList);
    let sessionPrizeDraw = surveyConstants.getSurveyConstants(constants.surveyTypes.sessionPrizeDraw);

    prepareSessionQuestions(sessionContactList, sessionId, accountId, constants.surveyTypes.sessionContactList).then(() => {
      return prepareSessionQuestions(sessionPrizeDraw, sessionId, accountId, constants.surveyTypes.sessionPrizeDraw);
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
  getSurveyStatsForSession: getSurveyStatsForSession,
  assignContactListToSessionSurveys: assignContactListToSessionSurveys,
  createDefaultSessionSurveys: createDefaultSessionSurveys
}
