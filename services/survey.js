'use strict';

var models = require('./../models');
var Survey = models.Survey;
var SurveyQuestion = models.SurveyQuestion;

var config = require('config');
// var constants = require('../util/constants');
// var async = require('async');
var _ = require('lodash');
var q = require('q');

const validUpdateParams = [
  'closed'
];

const validCreateParams = [
  'name',
  'accountId',
  'SurveyQuestions'
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

  Survey.findAll({ where: { accountId: user.accountOwnerId } }).then(function(surveys) {
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
  let validParams = validateParams(params, validCreateParams);

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

function updateSurvey(params, user) {
  let deferred = q.defer();
  let validParams = validateParams(params, validUpdateParams);

  models.sequelize.transaction(function (t) {
    return Survey.update(validParams, {
      where: { id: params.id, accountId: user.accountOwnerId },
      include: [ SurveyQuestion ],
      returning: true,
      transaction: t
    });
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
function validUrl(survey) {
  return 'http://' + config.get('server')['domain'] + ':' + config.get('server')['port'] + '/resources/survey/' + survey.id;
};

function validateParams(params, attributes) {
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
