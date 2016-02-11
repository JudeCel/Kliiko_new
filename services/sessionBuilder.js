"use strict";
var models = require('./../models');
var Session = models.Session;
var SessionMember = models.SessionMember;
var sessionTopics = models.sessionTopics;

var async = require('async');
var q = require('q');

const ROLES = {
  facilitator: facilitator
}

const MESSAGES = {
  setUp: "You have successfully initialized your chat session. Please continue in Step two."
}

function setUp(params) {
  let deferred = q.defer();

  Session.create(
    {
      accountId: params.accountId,
      name: params.name,
      start_time: params.start_time,
      end_time: params.end_time,
      resourceId: params.resourceId,
      brandProjectPreferenceId: params.brandProjectPreferenceId,
      step: "setUp"
    }
  ).then(function(result) {
    deferred.resolve({
      session: result, 
      message: MESSAGES.setUp
    })
  }).catch(function(errors) {
    deferred.reject(errors);
  });

  return deferred.promise;
}

function facilitatiorAndTopics(params) {
  let deferred = q.defer();

  async.parallel({
    sessionFacilitator: function(callback) {
      addFacilitator(sessionId, accountUserId, callback)
    },
    sessionTopics: function(callback) {
      addTopics(sessionId, topicIds, callback)
    }
  }, function(errors, results) {
    if(errors){
      deferred.reject(errors);
    }else{
      deferred.resolve(result);
    }
  });

  return deferred.promise;
}

function addFacilitator(sessionId, accountUserId, callback) {
  findSession(sessionId).then(function(session) {
    addSessionMember.(accountUserId, session, ROLES.facilitator, "NOIS name").then(function(result) {
      callback(null, result)
    }, function(error) {
      callback(error)
    })
  }, function(error) {
    callback(error)
  })
}

function findSession(sessionId) {
  let deferred = q.defer();

  Session.find({
    where: {id: sessionId}
  }).then(function(result) {
    deferred.resolve(result);
  }).catch(function(error) {
    deferred.reject(errors);
  })

  return deferred.promise;
}

function addSessionMember(accountUserId, session, role, name) {
  let deferred = q.defer();

  let params = { role: role,
                 accountUserId: accountUserId,
                 username: name,
                 avatar_info: "0:4:3:1:4:3" }

  session.createSessionMember(params).then(function(result) {
    SessionMemberService.createToken(result.id).then(function() {
      deferred.resolve(result);
    },function(error) {
      deferred.reject(error);
    })
  })
  .catch(function(error) {
    callback(error);
  });

  return deferred.promise;
}


function addTopics(sessionId, topicIds, callback) {
  let sessionTopicIds = [];

  topicIds.forEach(function(topicId, index, array) {
    
  });

  callback(null, s);
}

// Validations

// Exports
module.exports = {
  setUp: setUp
};
