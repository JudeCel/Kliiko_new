"use strict";
var models = require('./../models');
var Session  = models.Session;
var Account  = models.Account;
var AccountUser = models.AccountUser;
var User  = models.User;
var q = require('q');
var _ = require('lodash');
var async = require('async');
var policy = require('./../middleware/policy.js');

const messages = {
  removed: 'Session sucessfully deleted.',
  notFound: 'Session not fount.',
  duplicated: 'Session was successfully duplicated.',
  youDontHaveAccess: "You don't have access, to do this action."
};

const allowedRoles = ['admin', 'accountManager', 'facilitator']

function getAllSessions(accountId) {
  let deferred = q.defer();

  Session.findAll({
    accountId: accountId
  }).then(function(result) {
    deferred.resolve(result)
  })
  .catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function deleteSession (sessionId, userId) {
  let deferred = q.defer();
  validate(userId).then(function(passed) {
    if(passed == true){
      Session.destroy({ where: { id: sessionId} }).then(function(result) {
        if(result > 0) {
          deferred.resolve(messages.removed);
        }
        else {
          deferred.reject(messages.notFound);
        }
      }).catch(Session.sequelize.ValidationError, function(error) {
        deferred.reject(error);
      }).catch(function(error) {
        deferred.reject(error);
      });
    }else{
      deferred.reject(messages.youDontHaveAccess);
    }
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function copySession(sessionId, userId) {
  let deferred = q.defer();
  
  validate(userId).then(function(passed) {
    if(passed == true){
      Session.find({
        id: sessionId
      }).then(function(result) {
        delete result.dataValues["id"];
        Session.create(result.dataValues).then(function(dupRresult) {
          deferred.resolve({session: dupRresult, message: messages.duplicated});
        })
        .catch(function (err) {
          deferred.reject(err);
        });
      })
      .catch(function (err) {
        deferred.reject(err);
      });
    }else{
      deferred.reject(messages.youDontHaveAccess);
    }
  }, function(error) {
    deferred.reject(error);
  })
  
  return deferred.promise;
}

function validate(userId) { 
  let deferred = q.defer();
  let roles = [];
  
  findAccountUser(userId).then(function(accountUser) {
    roles.push(accountUser.role);
    deferred.resolve(policy.hasAccess(roles, allowedRoles));
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function findAccountUser(userId) {
  let deferred = q.defer();

  AccountUser.find({
    where: {UserId: userId}
  }).then(function(result) {
    deferred.resolve(result);
  })
  .catch(function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

module.exports = {
  getAllSessions: getAllSessions,
  copySession: copySession,
  deleteSession: deleteSession
}
