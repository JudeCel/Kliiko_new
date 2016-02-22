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
    },
    secondStep: {
      facilitator: 'No facilitator provided',
      topics: 'No topics selected'
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
    sessionBuilderObject(session).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(error);
    });
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
      sessionBuilderObject(updatedSession).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });
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
        sessionBuilderObject(updatedSession).then(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        });
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
    sessionBuilderObject(session).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(error);
    });
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
  let deferred = q.defer();

  stepsDefinition(session).then(function(result) {
    deferred.resolve({
      sessionBuilder: {
        steps: result,
        currentStep: session.step,
        id: session.id
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function stepsDefinition(session) {
  let deferred = q.defer();
  let object = {};

  object.step1 = {
    stepName: "setUp",
    name: session.name,
    startTime: session.startTime,
    endTime: session.endTime,
    resourceId: session.resourceId,
    brandProjectPreferenceId:  session.brandProjectPreferenceId
  };

  object.step2 = { stepName: 'facilitatiorAndTopics' };
  async.parallel(step2Queries(session, object.step2), function(error, _result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      // async.parallel(step3Queries(session, object), function(error, _result) {
      // });
      deferred.resolve(object);
    }
  });

  object.step3 = {
    stepName: "manageSessionEmails",
    incentive_details: null,
    emailTemplates: null
  };
  object.step4 = {
    stepName: "manageSessionParticipants",
    participants: null
  };
  object.step5 = {
    stepName: "inviteSessionObservers",
    observers: null
  };

  return deferred.promise;
}

function step2Queries(session, step) {
  return [
    function(cb) {
      models.SessionMember.find({
        where: {
          sessionId: session.id,
          role: 'facilitator'
        }
      }).then(function(member) {
        if(member) {
          step.facilitator = member.id;
        }
        cb();
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    },
    function(cb) {
      models.Topic.findAll({
        include: [{
          model: models.Session,
          where: {
            id: session.id
          }
        }]
      }).then(function(topics) {
        step.topics = topics;
        cb();
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    }
  ];
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
    validateStepTwo(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
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

function validateStepTwo(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    let object = {};
    async.parallel(step2Queries(session, object), function(error, _result) {
      if(error) {
        deferred.reject(error);
      }
      else {
        let errors = {};
        if(!object.facilitator) {
          errors.facilitator = MESSAGES.errors.secondStep.facilitator;
        }

        if(_.isEmpty(object.topics)) {
          errors.topics = MESSAGES.errors.secondStep.topics;
        }

        _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}
