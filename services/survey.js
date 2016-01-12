'use strict';

var models = require('./../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;

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
  'SurveyQuestions'
];

const returnParamsSurvey = [
  'id',
  'accountId',
  'name',
  'description',
  'closed',
  'confirmedAt',
  'url'
];

const returnParamsQuestions = [
  'id',
  'surveyId',
  'name',
  'question',
  'order',
  'answers'
];

// Exports
function findSurvey(id) {
  let deferred = q.defer();

  Survey.find({ where: { id: id } }).then(function(survey) {
    if(survey) {
      deferred.resolve(survey);
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

// Needs updated test
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

// Untested
function copySurvey(params) {
  let deferred = q.defer();

  Survey.find({
    where: { id: params.id },
    attributes: ['accountId', 'name'],
    include: [{
      model: SurveyQuestion,
      attributes: ['name', 'question', 'order', 'answers']
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

// Helpers
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
      }).catch(Survey.sequelize.ValidationError, function(error) {
        deferred.reject(prepareErrors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      question.surveyId = surveyId;
      SurveyQuestion.create(question).then(function() {
        deferred.resolve(true);
      }).catch(Survey.sequelize.ValidationError, function(error) {
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
  return 'http://' + config.get('server')['domain'] + ':' + config.get('server')['port'] + '/resources/survey/' + survey.id;
};

function validateParams(params, attributes) {
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
  updateSurvey: updateSurvey,
  removeSurvey: removeSurvey,
  copySurvey: copySurvey
};
