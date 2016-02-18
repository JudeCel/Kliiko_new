"use strict";
var models = require('./../models');
var filters = require('./../models/filters');
var Session = models.Session;

var async = require('async');
var q = require('q');

const MESSAGES = {
  setUp: "You have successfully setted up your chat session.",
  cancel: "Session build successfully canceled",
  notFound: "Session build not found",

  errors: {
    firstStep: {
      invalidDateRange: "Start date can't be higher then end date."
    }
  }
};

// Exports
module.exports = {
  initializeBuilder: initializeBuilder,
  openBuild: openBuild,
  destroy: destroy,
  update: update,
  nextStep: nextStep
};

function sessionBuilderObject(session) {
  return {
    sessionBuilder: {
      steps: stepsDefinition(session),
      currentStep: session.step,
      id: session.id
    }
  }
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

function initializeBuilder(params) {
  let deferred = q.defer();
  params.step = 'setUp';
  Session.create(params).then(function(session) {
    deferred.resolve(sessionBuilderObject(session))
  }).catch(function(errors) {
    deferred.reject(filters.errors(errors));
  });
  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();
  validate(params).then(function(result) {
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
  }, function(errors) {
    deferred.reject(errors);
  })

  return deferred.promise;
}

function validate(params) {
  let deferred = q.defer();
  currentStep(params.id).then(function(result) {
    findValidation(result.step, params).then(function(result) {
      deferred.resolve();
    }, function(errors) {
      deferred.reject(errors);
    })
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function findValidation(step, params) {
  let deferred = q.defer();

  if(step == 'setUp'){
    validateStepOne(params).then(function(result) {
      deferred.resolve();
    }, function(errors) {
      deferred.reject(errors);
    })
  }

  return deferred.promise;
}

function validateStepOne(params) {
  let deferred = q.defer();
  let errors = {}

  if(params.start_time > params.end_time){
    errors.invalidDateRange = MESSAGES.errors.firstStep.invalidDateRange
  }

  if (errors) {
    deferred.reject(errors);
  } else {
    deferred.resolve();
  }

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


function findNextStep(step) {
  // Always return step!
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

function destroy(id) {
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

function currentStep(id) {
  let deferred = q.defer();
  Session.find({where: { id: id } } ).then(function(session) {
    if (session) {
      deferred.resolve(session);
    }else {
      deferred.reject({notFound: MESSAGES.notFound});
    }
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}
