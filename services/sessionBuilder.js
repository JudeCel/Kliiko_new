"use strict";
var models = require('./../models');
var Session = models.Session;

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
  cancel: cancel,
  update: update,
  nextStep: nextStep
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
    step1: {
      stepName: "setUp"
      name: session.name,
      startTime: session.startTime,
      endTime: session.endTime,
      resourceId: session.resourceId,
      brandProjectPreferenceId:  session.brandProjectPreferenceId
    },
    step2:{ stepName: "facilitatiorAndTopics" },
    step3:{ stepName: "manageSessionEmails" },
    step4:{ stepName: "manageSessionParticipants" },
    step5:{ stepName: "inviteSessionObservers" }
  }
}

function update(params) {
  let deferred = q.defer();
  Session.find({where: {id: params.id, accountId: params.accountId }}).then(function (session) {
    if (session) {
      session.updateAttributes(params).then(function(updateSesion) {
        deferred.resolve(sessionBuilderObject(updateSesion));
      }, function(error) {
        deferred.reject(error);
      });
    }else {
      deferred.reject({notFound: MESSAGES.notFound});
    }
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
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
      deferred.resolve(sessionBuilderObject(session));
    }else {
      deferred.reject({notFound: MESSAGES.notFound});
    }
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

function nextStep(id, accountId) {
  let deferred = q.defer();
  Session.find({where: {id: id, accountId: accountId }}).then(function (session) {
    if (session) {
      session.updateAttributes({step: findNextStep(session.step)}).then(function(updateSesion) {
        deferred.resolve(sessionBuilderObject(updateSesion));
      }, function(error) {
        deferred.reject(error);
      });
    }else {
      deferred.reject({notFound: MESSAGES.notFound});
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findNextStep(step) {
  // Allways return step!
  // If current step is the last step then return last step.
  // The order for step array is important always keep right order!!!
  let steps = ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
    'manageSessionParticipants', 'inviteSessionObservers', 'done']
  let currentIndex = steps.indexOf(step);
  let nextStep = steps[++currentIndex];

  if (currentIndex > -1 && nextStep) {
    return nextStep;
  }else{
    return step;
  }
}

function cancel(id) {
  let deferred = q.defer();
  Session.destroy({ where: { id: id } }).then(function(result) {
    if(result == 0) {
      deferred.reject({notFound: MESSAGES.notFound});
    }else{
      deferred.resolve(MESSAGES.cancel);
    }
  },function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}
