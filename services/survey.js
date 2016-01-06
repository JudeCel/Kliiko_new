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
  'accountId',
];

// Exports
function makeValidUrl(survey) {
  return 'http://' + config.get('server')['domain'] + ':' + config.get('server')['port'] + 'resources/survey' + survey.id;
}

function findSurvey(id) {
  let deferred = q.defer();

  Survey.find({ where: { id: id }, include: [ SurveyQuestion ] }).then(function(survey) {
    if(survey) {
      deferred.resolve(survey);
    }
    else {
      deferred.reject('Survey not found');
    }
  }).catch(function(error) {
    deferred.reject(prepareErrors(error));
  });

  return deferred.promise;
}

function findAllSurveys(user) {
  let deferred = q.defer();

  Survey.findAll({ where: { accountId: user.accountOwnerId } }).then(function(surveys) {
    deferred.resolve(surveys);
  }).catch(function(error) {
    deferred.reject(prepareErrors(error));
  });

  return deferred.promise;
};

function createSurveyWithQuestions(params) {
  let deferred = q.defer();
  let validParams = validateParams(params, validCreateParams);

  Survey.create(params, { include: [ SurveyQuestion ]}).then(function(survey) {
    deferred.resolve(survey);
  }).catch(function(error) {
    deferred.reject(prepareErrors(error));
  });

  return deferred.promise;
};

function updateSurvey(params) {
  let deferred = q.defer();
  let validParams = validateParams(params, validUpdateParams);

  Survey.update(validParams, {
    where: { id: params.id },
    include: [ SurveyQuestion ],
    returning: true
  }).then(function(result) {
    if(result[0] == 0) {
      deferred.reject('Survey not found');
    }
    else {
      let survey = result[1][0];
      deferred.resolve(survey);
    }
  }).catch(function(error) {
    deferred.reject(prepareErrors(error));
  });

  return deferred.promise;
}

// Helpers
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
  makeValidUrl: makeValidUrl,
  findSurvey: findSurvey,
  findAllSurveys: findAllSurveys,
  createSurveyWithQuestions: createSurveyWithQuestions,
  updateSurvey: updateSurvey
};
