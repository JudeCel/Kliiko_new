"use strict";
var models = require('./../models');
var Session  = models.Session;
var Account  = models.Account;
var AccountUser = models.AccountUser;
var User  = models.User;
var q = require('q');
var _ = require('lodash');
var async = require('async');

const MESSAGES = {
  removed: 'Session sucessfully deleted.',
  notFound: 'Session not fount.',
  duplicated: 'Session was successfully duplicated.',
  youDontHaveAccess: "You don't have access, to do this action."
};


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

function deleteSession (sessionId, accountId, userId) {
  let deferred = q.defer();
  validate(accountId, userId, function (error, passed) {
    if(passed == true){
      Session.destroy({ where: { id: sessionId} }).then(function(result) {
        if(result > 0) {
          deferred.resolve(MESSAGES.removed);
        }
        else {
          deferred.reject(MESSAGES.notFound);
        }
      }).catch(Session.sequelize.ValidationError, function(error) {
        deferred.reject(error);
      }).catch(function(error) {
        deferred.reject(error);
      });
    }else{
      deferred.reject(error);
    }
  })

  return deferred.promise;
}

function copySession(sessionId) {
  let deferred = q.defer();

  Session.find({
    id: sessionId
  }).then(function(result) {
    delete result.dataValues["id"];
    Session.create(result.dataValues).then(function(dupRresult) {
      deferred.resolve({session: dupRresult, message: MESSAGES.duplicated});
    })
    .catch(function (err) {
      deferred.reject(err);
    });
  })
  .catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function validate(accountId, userId, callback) { 
  async.parallel({
    isAccountManager: function(callback) {
      isAccountManager(accountId, userId, callback);
    },
    isFacilitator: function(callback) {
      isFacilitator(userId, callback);
    },
    idAdmin: function(callback) {
      isAdmin(userId, callback);
    }
  }, function(err, result) {
    console.log("#######################");
    console.log(result);
    console.log("#######################");
    if(result.isAccountManager == true || result.isFacilitator == true || result.isAdmin == true){
      callback(null, true)
    }else{
      callback(MESSAGES.youDontHaveAccess)
    }
  });
}

function isAccountManager(accountId, userId, callback) {
  getAllAccountManagerIds(accountId, function(ids) {
    if (ids.indexOf(userId) > -1) {
      callback(null, true)
    } else {
      callback(false)   
    }
  });
}


function isFacilitator(userId, callback) {
  callback(null, true)
}

function isAdmin(userId, callback) {
  callback(null, true)
}

function getAllAccountManagerIds(accountId, callback) {
  AccountUser.findAll({
    where: {
      AccountId: accountId, 
      role: 'accountManager'
    }
  }).then(function(accountManagers) {
    let ids = [];
    _.forEach(accountManagers, function(accountManager) {
      ids.push(accountManager.id);
    });
    callback(ids);
  })
}

module.exports = {
  getAllSessions: getAllSessions,
  copySession: copySession,
  deleteSession: deleteSession
}
