'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Session = models.Session;

var constants = require('./../util/constants');

var async = require('async');
var _ = require('lodash');
var q = require('q');

const MESSAGES = {
  setUp: "You have successfully setted up your chat session.",
  cancel: "Session build successfully canceled",
  notFound: "Session build not found",

  errors: {
    firstStep: {
      nameRequired: 'Name must be provided',
      startTimeRequired: 'Start time must be provided',
      endTimeRequired: 'End time must be provided',
      invalidDateRange: "Start date can't be higher then end date."
    }
  }
};

// Exports
module.exports = {
  messages: MESSAGES,
  initializeBuilder: initializeBuilder,
  findSession: findSession,
  update: update,
  nextStep: nextStep,
  openBuild: openBuild,
  destroy: destroy
};

function initializeBuilder(params) {
  let deferred = q.defer();

  params.step = 'setUp';
  Session.create(params).then(function(session) {
    deferred.resolve(sessionBuilderObject(session));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findSession(id, accountId) {
  let deferred = q.defer();

  Session.find({
    where: {
      id: id,
      accountId: accountId
    }
  }).then(function(session) {
    if(session) {
      deferred.resolve(session);
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    session.updateAttributes(params).then(function(updatedSession) {
      deferred.resolve(sessionBuilderObject(updatedSession));
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function nextStep(id, accountId, params) {
  let deferred = q.defer();

  findSession(id, accountId).then(function(session) {
    validate(session, params).then(function() {
      session.updateAttributes({ step: findNextStep(session.step) }).then(function(updatedSession) {
        deferred.resolve(sessionBuilderObject(updatedSession));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Untested
function openBuild(id, accountId) {
  let deferred = q.defer();

  findSession(id, accountId).then(function(session) {
    deferred.resolve(sessionBuilderObject(session));
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Untested
function destroy(id, accountId) {
  let deferred = q.defer();

  findSession(id, accountId).then(function(session) {
    session.destroy(function(result) {
      deferred.resolve(MESSAGES.cancel);
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Helpers
function findNextStep(step) {
  let steps = constants.sessionBuilderSteps;
  let currentIndex = steps.indexOf(step);
  let nextStep = steps[++currentIndex];

  if(currentIndex > -1 && nextStep) {
    return nextStep;
  }
  else{
    return step;
  }
}

function sessionBuilderObject(session) {
  return {
    sessionBuilder: {
      steps: stepsDefinition(session),
      currentStep: session.step,
      id: session.id
    }
  };
}

function stepsDefinition(session) {
  return {
    step1: {
      stepName: "setUp",
      name: session.name,
      startTime: session.startTime,
      endTime: session.endTime,
      resourceId: session.resourceId,
      brandProjectPreferenceId:  session.brandProjectPreferenceId
    },
    step2:{
      stepName: "facilitatiorAndTopics",
      facilitator: null,
      topics: null
    },
    step3:{
      stepName: "manageSessionEmails",
      incentive_details: null,
      emailTemplates: null
    },
    step4:{
      stepName: "manageSessionParticipants",
      participants: null
    },
    step5:{
      stepName: "inviteSessionObservers",
      observers: null
    }
  }
}

function validate(session, params) {
  let deferred = q.defer();

  findValidation(session.step, params).then(function() {
    deferred.resolve();
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findValidation(step, params) {
  let deferred = q.defer();

  if(step == 'setUp') {
    let error = validateStepOne(params);
    error ? deferred.reject(error) : deferred.resolve();
  }
  else if(step == 'facilitatiorAndTopics') {

  }

  return deferred.promise;
}

function validateStepOne(params) {
  let errors = {}

  if(!params.name) {
    errors.name = MESSAGES.errors.firstStep.nameRequired;
  }

  if(!params.startTime) {
    errors.startTime = MESSAGES.errors.firstStep.startTimeRequired;
  }

  if(!params.endTime) {
    errors.endTime = MESSAGES.errors.firstStep.endTimeRequired;
  }

  if(params.startTime > params.endTime) {
    errors.startTime = MESSAGES.errors.firstStep.invalidDateRange;
  }

  return _.isEmpty(errors) ? null : errors;
}
