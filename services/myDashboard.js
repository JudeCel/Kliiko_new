'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Account = models.Account;
var AccountUser = models.AccountUser;
var Session = models.Session;
var SessionMember = models.SessionMember;

var q = require('q');
var _ = require('lodash');
var async = require('async');

var subdomains = require('./../lib/subdomains.js');

module.exports = {
  getAllData: getAllData,
  getAllAccountUsers: getAllAccountUsers,
  getAllSessions: getAllSessions
}

// Exports
function getAllData(userId, protocol) {
  let deferred = q.defer();

  async.waterfall([
    function(cb) {
      getAllAccountUsers(userId, protocol).then(function(accountUsers) {
        cb(null, accountUsers);
      }, function(error) {
        cb(error);
      });
    },
    function(accountUsers, cb) {
      getAllSessions(userId).then(function(sessions) {
        let object = { accountUsers: accountUsers, sessions: sessions };
        cb(null, object);
      }, function(error) {
        cb(error);
      });
    }
  ], function(error, data) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

function getAllAccountUsers(userId, protocol) {
  let deferred = q.defer();

  AccountUser.findAll({
    where: {
      UserId: userId
    },
    include: [Account]
  }).then(function(accountUsers) {
    deferred.resolve(prepareAccountUsers(accountUsers, protocol));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function getAllSessions(userId) {
  let deferred = q.defer();

  Session.findAll({
    include: [{
      model: SessionMember,
      role: 'participant',
      include: [{
        model: AccountUser,
        where: {
          UserId: userId
        }
      }]
    }]
  }).then(function(sessions) {
    deferred.resolve(sessions);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Helpers
function prepareAccountUsers(accountUsers, protocol) {
  let object = {
    accountManager: { name: 'Account Manager', field: 'accountManager', data: [] },
    observer: { name: 'Observer', field: 'observer', data: [] },
    facilitator: { name: 'Facilitator', field: 'facilitator', data: [] }
  };

  _.map(accountUsers, function(accountUser) {
    if(object[accountUser.role]) {
      accountUser.dataValues.dashboardUrl = subdomains.url({ protocol: protocol }, accountUser.Account.name, '/dashboard');
      object[accountUser.role].data.push(accountUser);
    }
  });

  _.map(object, function(value, key) {
    if(_.isEmpty(value.data)) {
      delete object[key];
    }
  });

  return object;
}
