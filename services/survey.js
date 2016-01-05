'use strict';

var models = require('./../models');
var Survey = models.Survey;

// var constants = require('../util/constants');
// var async = require('async');
// var _ = require('lodash');
var q = require('q');

function findAllSurveys(user) {
  var deferred = q.defer();

  Survey.findAll({ where: { accountId: user.accountOwnerId } }).then(function(surveys) {
    deferred.resolve(surveys);
  }).catch(function(error) {
    deferred.reject(prepareErrors(error));
  });

  return deferred.promise;
};

// function createSurvey(params, callback) {
//   Survey.create(params).then(function(surveys) {
//     callback(null, surveys);
//   }).catch(function(error) {
//     callback(prepareErrors(error));
//   });
// };


function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ':' + n.message.replace(n.path, '');
  });
  return errors;
};

module.exports = {
  findAllSurveys: findAllSurveys
};
