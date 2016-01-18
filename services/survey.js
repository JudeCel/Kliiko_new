'use strict';

var models = require('./../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;
var SurveyAnswer = models.SurveyAnswer;

var config = require('config');
// var constants = require('../util/constants');
// var async = require('async');
var _ = require('lodash');
var q = require('q');

const validManageParams = [
  'accountId',
  'name',
  'closed',
  'description',
  'thanks',
  'SurveyQuestions'
];

const returnParamsSurvey = [
  'id',
  'accountId',
  'name',
  'description',
  'thanks',
  'closed',
  'confirmedAt',
  'url'
];

const returnParamsQuestions = [
  'id',
  'surveyId',
  'name',
  'type',
  'question',
  'order',
  'answers'
];

// Exports
function findSurvey(id) {
  let deferred = q.defer();

  Survey.find({
    where: { id: id },
    attributes: returnParamsSurvey,
    include: [{
      model: SurveyQuestion,
      attributes: returnParamsQuestions
    }],
    order: [
      [SurveyQuestion, 'order', 'ASC']
    ]
  }).then(function(survey) {
    if(survey) {
      if(survey.closed) {
        deferred.reject('Survey closed, please contact admin!');
      }
      else {
        deferred.resolve(survey);
      }
    }
    else {
      deferred.reject('Survey not found');
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findAllSurveys(user) {
  let deferred = q.defer();

  Survey.findAll({
    where: { accountId: user.accountOwnerId },
    attributes: returnParamsSurvey,
    order: [
      ['id', 'asc'],
      [SurveyQuestion, 'order', 'ASC']
    ],
    include: [{
      model: SurveyQuestion,
      attributes: returnParamsQuestions
    }]
  }).then(function(surveys) {
    deferred.resolve(surveys);
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function createSurveyWithQuestions(params) {
  let deferred = q.defer();
  let validParams = validateParams(params, validManageParams);

  models.sequelize.transaction(function (t) {
    return Survey.create(validParams, { include: [ SurveyQuestion ], transaction: t });
  }).then(function(survey) {
    survey.update({ url: validUrl(survey) }).then(function(survey) {
      deferred.resolve(survey);
    });
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function changeStatus(params, user) {
  let deferred = q.defer();

  Survey.update({ closed: params.closed }, {
    where: { id: params.id, accountId: user.accountOwnerId },
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject('Survey not found');
    }
    else {
      let survey = result[1][0];
      deferred.resolve(survey);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function updateSurvey(params, user) {
  let deferred = q.defer();
  let validParams = validateParams(params, validManageParams);

  models.sequelize.transaction(function (t) {
    return Survey.update(validParams, {
      where: { id: params.id, accountId: user.accountOwnerId },
      include: [ SurveyQuestion ],
      returning: true,
      transaction: t
    }).then(function(result) {
      if(result[0] == 0) {
        throw 'Survey not found';
      }
      else {
        let survey = result[1][0];
        return SurveyQuestion.destroy({
          where: {
            surveyId: survey.id,
            id: { $notIn: getIds(validParams.SurveyQuestions) }
          },
          transaction: t
        }).then(function() {
          return bulkUpdateQuestions(survey.id, validParams.SurveyQuestions, t).then(function() {
            t.commit();
            return survey;
          }, function() {
            t.rollback();
            return survey;
          });
        });
      }
    });
  }).then(function(survey) {
    deferred.resolve(survey);
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function removeSurvey(id, user) {
  let deferred = q.defer();

  Survey.destroy({ where: { id: id, accountId: user.accountOwnerId } }).then(function(result) {
    if(result > 0) {
      deferred.resolve('Successfully removed survey');
    }
    else {
      deferred.reject('Survey not found');
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copySurvey(params) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id },
    attributes: ['accountId', 'name', 'description'],
    include: [{
      model: SurveyQuestion,
      attributes: ['name', 'question', 'order', 'answers', 'type']
    }]
  }).then(function(survey) {
    if(survey) {
      createSurveyWithQuestions(survey).then(function(copy) {
        deferred.resolve(copy);
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject('Survey not found');
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function answerSurvey(params) {
  let deferred = q.defer();
  let validParams = validAnswerParams(params);

  SurveyAnswer.bulkCreate(validParams).then(function() {
    deferred.resolve('Successfully completed survey!');
  }).catch(SurveyAnswer.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

//Untested
function confirmSurvey(params, user) {
  let deferred = q.defer();

  Survey.update({ confirmedAt: params.confirmedAt }, {
    where: { id: params.id, accountId: user.accountOwnerId },
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject('Survey not found');
    }
    else {
      let survey = result[1][0];
      deferred.resolve(survey);
    }
  }).catch(Survey.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Helpers
function validAnswerParams(params) {
  let questions = [];
  for(let i in params.SurveyQuestions) {
    let answer = params.SurveyQuestions[i].answer;
    let question = { answer: {} };
    question.surveyId = params.surveyId;
    question.surveyQuestionId = parseInt(i);
    question.answer.type = typeof answer;
    question.answer.value = answer;
    questions.push(question);
  }

  return questions;
}

function bulkUpdateQuestions(surveyId, questions, t) {
  let deferred = q.defer();

  questions.forEach(function(question, index, array) {
    if(question.id && question.surveyId) {
      SurveyQuestion.update(question, {
        where: {
          surveyId: question.surveyId,
          id: question.id
        },
        transaction: t
      }).then(function(results) {
        if(index == array.length - 1) {
          deferred.resolve(true);
        }
      }).catch(SurveyQuestion.sequelize.ValidationError, function(error) {
        deferred.reject(prepareErrors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      question.surveyId = surveyId;
      SurveyQuestion.create(question).then(function() {
        deferred.resolve(true);
      }).catch(SurveyQuestion.sequelize.ValidationError, function(error) {
        deferred.reject(prepareErrors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
  });

  return deferred.promise;
}

function getIds(questions) {
  let ids = [];
  questions.forEach(function(question, index, array) {
    ids.push(question.id);
  });
  return ids;
};

function validUrl(survey) {
  return 'http://' + config.get('server')['domain'] + ':' + config.get('server')['port'] + '/survey/' + survey.id;
};

function validateParams(params, attributes) {
  if(_.isObject(params.SurveyQuestions)) {
    let array = [];
    _.map(params.SurveyQuestions, function(n) {
      array.push(n);
    });
    params.SurveyQuestions = array;
  }

  params.SurveyQuestions = _.remove(params.SurveyQuestions, function(n) {
    return _.isObject(n);
  });

  return _.pick(params, attributes);
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ':' + n.message.replace(n.path, '');
  });
  return errors;
};

module.exports = {
  findSurvey: findSurvey,
  findAllSurveys: findAllSurveys,
  createSurveyWithQuestions: createSurveyWithQuestions,
  changeStatus: changeStatus,
  updateSurvey: updateSurvey,
  removeSurvey: removeSurvey,
  copySurvey: copySurvey,
  answerSurvey: answerSurvey,
  confirmSurvey: confirmSurvey
};
