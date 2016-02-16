"use strict";
var models = require('./../models');
var Session = models.Session;
var SessionMember = models.SessionMember;
var sessionTopics = models.sessionTopics;

var async = require('async');
var q = require('q');

const MESSAGES = {
  setUp: "You have successfully setted up your chat session.",
  cancel: "Session build successfully canceled",
  notFound: "Session build not found"
}

// Exports
module.exports = {
  initializeBuilder: initializeBuilder,
  openBuild: openBuild,
  cancel: cancel
};

function sessionBuilderObject(session) {
  return {
    sessionBuilder: {
      steps: stepsDefination(session),
      currentStep: session.step,
      id: session.id
    }
  }
}


function stepsDefination(session) {
  return {
    setUp: {
      name: session.name,
      startTime: session.startTime,
      endTime: session.endTime,
      resourceId: session.resourceId,
      brandProjectPreferenceId:  session.brandProjectPreferenceId
    },
    facilitatiorAndTopics:{},
    manageSessionEmails:{},
    manageSessionParticipants: {},
    inviteSessionObservers: {}
  }
}

function initializeBuilder(params) {
  let deferred = q.defer();
  params.step = 'setUp';
  Session.create(params).then(function(session) {
    deferred.resolve(sessionBuilderObject(session))
  }).catch(function(errors) {
    deferred.reject(errors);
  });
  return deferred.promise;
}


function openBuild(id, accountId) {
  let deferred = q.defer();
  Session.find({where: { id: id, accountId: accountId } } ).then(function(session) {
    if (session) {
      deferred.resolve(sessionBuilderObject(session))
    }else {
      deferred.reject({notFound: MESSAGES.notFound})
    }
  }, function(error) {
    deferred.reject(error);
  })
  return deferred.promise;
}

function cancel(id) {
  let deferred = q.defer();
  Session.destroy({ where: { id: id } }).then(function(result) {
    if(result == 0) {
      deferred.reject({notFound: MESSAGES.notFound})
    }else{
      deferred.resolve(MESSAGES.cancel)
    }
  },function(error) {
    deferred.reject(error);
  })
  return deferred.promise;
}
