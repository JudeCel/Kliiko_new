'use strict';

var models = require('./../models');
var Session  = models.Session;

var q = require('q');
var _ = require('lodash');
var async = require('async');

const MESSAGES = {
  notFound: 'Session not found',
  removed: 'Session sucessfully removed',
  copied: 'Session sucessfully copied'
};

// const allowedRoles = ['admin', 'accountManager', 'facilitator']

// Exports
function findSession(sessionId, accountId) {
  let deferred = q.defer();

  Session.find({ where: { id: sessionId, accountId: accountId } }).then(function(session) {
    if(session) {
      deferred.resolve(simpleParams(session));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findAllSessions(accountId) {
  let deferred = q.defer();

  Session.findAll({ where: { accountId: accountId } }).then(function(sessions) {
    deferred.resolve(simpleParams(sessions));
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function removeSession(sessionId, accountId) {
  let deferred = q.defer();

  findSession(sessionId, accountId).then(function(result) {
    result.data.destroy().then(function() {
      deferred.resolve(simpleParams(null, MESSAGES.removed));
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copySession(sessionId, accountId) {
  let deferred = q.defer();

  findSession(sessionId, accountId).then(function(result) {
    delete result.data.dataValues.id;

    Session.create(result.data.dataValues).then(function(session) {
      deferred.resolve(simpleParams(session, MESSAGES.copied));
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Helpers
function simpleParams(data, message) {
  return { data: data, message: message };
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    let message = n.message.replace(n.path, '');
    if(message == ' cannot be null') {
      message = ' cannot be empty';
    }
    errors[n.path] = _.startCase(n.path) + ':' + message;
  });
  return errors;
};

module.exports = {
  messages: MESSAGES,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession
}
