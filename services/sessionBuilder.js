"use strict";
var models = require('./../models');
var Session = models.Session;
var SessionMember = models.SessionMember;
var sessionTopics = models.sessionTopics;

var async = require('async');
var q = require('q');

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
  async.parallel({
    sessionFacilitator: function(callback) {
      addFacilitator(sessionId, accountUserId, callback)
    },
    sessionTopics: function(callback) {
      addTopics(sessionId, topicIds, callback)
    }
  }, function(err, results) {
    
  });
}

function addFacilitator(sessionId, accountUserId, callback) {
  let memberIds = [];

  SessionMember.create({
    sessionId: sessionId,
    accountUserId: accountUserId,
    role: 'facilitator'
  })

  callback(null, memberIds);
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
