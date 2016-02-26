'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Session = models.Session;
var AccountUser = models.AccountUser;

var constants = require('./../util/constants');
var inviteService = require('./invite');

var async = require('async');
var _ = require('lodash');
var q = require('q');

const MIN_MAIL_TEMPLATES = 5;

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
    },
    thirdStep: {
      emailTemplates: "Not enought mail templates provided, needed "
    },
    fourthStep: {
      participants: 'No participants provided'
    },
    fifthStep: {
      observers: 'No observers provided'
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
  prevStep: prevStep,
  openBuild: openBuild,
  destroy: destroy,
  sendSms: sendSms,
  inviteMembers: inviteMembers
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
      session.updateAttributes({ step: findNewStep(session.step, false) }).then(function(updatedSession) {
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

function prevStep(id, accountId) {
  let deferred = q.defer();

  findSession(id, accountId).then(function(session) {
    session.updateAttributes({ step: findNewStep(session.step, true) }).then(function(updatedSession) {
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

// Untested
function openBuild(id, accountId) {
  let deferred = q.defer();

  findSession(id, accountId).then(function(session) {
    sessionBuilderObject(session).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      console.log(error);
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

// Untested
function sendSms(data) {
  let deferred = q.defer();
  let numbers = _.map(data.recievers, 'mobile');

  twilioLib.sendSms(numbers, data.message).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Untested
function inviteMembers(sessionId, data) {
  let deferred = q.defer();

  inviteParams(sessionId, data).then(function(params) {
    inviteService.createBulkInvites(params).then(function(invites) {
      let ids = _.map(invites, 'accountUserId');
      AccountUser.findAll({ where: { id: { $in: ids } }, include:[models.Invite] }).then(function(accountUsers) {
        _.map(accountUsers, function(accountUser) {
          accountUser.dataValues.invite = _.last(accountUser.Invites);
        });

        deferred.resolve(accountUsers);
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

function inviteParams(sessionId, data) {
  let deferred = q.defer();
  let ids = _.map(data.members, 'id');

  models.ContactListUser.findAll({ where: { id: { $in: ids } } }).then(function(clUsers) {
    let params = _.map(clUsers, function(clUser) {
      return {
        accountUserId: clUser.accountUserId,
        sessionId: sessionId,
        role: data.role,
        userType: 'existing'
      }
    });

    deferred.resolve(params);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Helpers
function findNewStep(step, previous) {
  let steps = constants.sessionBuilderSteps;
  let currentIndex = steps.indexOf(step);
  let newStep;

  if(previous) {
    newStep = steps[--currentIndex];
  }
  else {
    newStep = steps[++currentIndex];
  }

  if(currentIndex > -1 && newStep) {
    return newStep;
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
  async.parallel([
    function(cb) {
      async.parallel(step2Queries(session, object.step2), function(error, _result) {
        cb(error);
      });
    },
    function(cb) {
      step3Query(session.id).then(function(emailTemplates) {
        object.step3 = {
          stepName: 'manageSessionEmails',
          incentive_details: null,
          emailTemplates: emailTemplates
        }
        cb();
      }, function(error) {
        cb(error);
      })
    },
    function(cb) {
      async.waterfall(step4and5Queries(session, 'participant'), function(error, members) {
        if(error) {
          cb(error);
        }
        else {
          object.step4 = {
            stepName: 'manageSessionParticipants',
            participants: members
          };
          cb();
        }
      });
    },
    function(cb) {
      async.waterfall(step4and5Queries(session, 'observer'), function(error, members) {
        if(error) {
          cb(error);
        }
        else {
          object.step5 = {
            stepName: 'inviteSessionObservers',
            observers: members
          };
          cb();
        }
      });
    }
  ], function(error, _result) {
    error ? deferred.reject(error) : deferred.resolve(object);
  });

  return deferred.promise;
}

function searchSessionMembers(sessionId, role) {
  return AccountUser.findAll({
    include: [{
      model: models.SessionMember,
      where: {
        sessionId: sessionId,
        role: role
      }
    }]
  });
}

function countRequiredMailTemplates(mailTemplates) {
  let count = 0;
  _.map(mailTemplates, function(mailTemplate) {
    if(mailTemplate.required) {
      count++;
    }
  });

  return count;
}

function step2Queries(session, step) {
  return [
    function(cb) {
      searchSessionMembers(session.id, 'facilitator').then(function(members) {
        if(!_.isEmpty(members)) {
          step.facilitator = members[0].id;
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

function step3Query(sessionId) {
  let deferred = q.defer();

  models.MailTemplate.findAll({
    where: {sessionId: sessionId}
  }).then(function(emailTemplates) {
    deferred.resolve(emailTemplates);
  }).catch(function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function step4and5Queries(session, role) {
  return [
    function(cb) {
      searchSessionMembers(session.id, role).then(function(accountUsers) {
        _.map(accountUsers, function(accountUser) {
          accountUser.dataValues.sessionMember = _.last(accountUser.SessionMembers);
        });

        cb(null, accountUsers);
      }, function(error) {
        cb(error);
      });
    },
    function(members, cb) {
      AccountUser.findAll({
        include: [{
          model: models.Invite,
          where: {
            ownerId: session.id,
            ownerType: 'session',
            role: role,
            status: { $ne: 'confirmed' }
          },
          attributes: ['status']
        }]
      }).then(function(accountUsers) {
        _.map(accountUsers, function(accountUser) {
          accountUser.dataValues.invite = _.last(accountUser.Invites);
        });

        cb(null, members.concat(accountUsers));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
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
  else if(step == 'manageSessionEmails') {
    validateStepThree(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
  }
  else if(step == 'manageSessionParticipants') {
    validateStepFour(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
  }
  else if(step == 'inviteSessionObservers') {
    validateStepFive(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    deferred.resolve();
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

function validateStepThree(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    models.MailTemplate.findAll({
      where: {sessionId: session.id}
    }).then(function(mailTemplates) {
      let errors = {};
      let count = countRequiredMailTemplates(mailTemplates);

      if(count < MIN_MAIL_TEMPLATES){
        errors.emailTemplates = MESSAGES.errors.thirdStep.emailTemplates + MIN_MAIL_TEMPLATES;
      }

      _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
    }).catch(function(error) {
      deferred.reject(error);
    })
  })

  return deferred.promise;
}

function validateStepFour(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    searchSessionMembers(session.id, 'participant').then(function(members) {
      let errors = {};
      if(_.isEmpty(members)) {
        errors.participants = MESSAGES.errors.fourthStep.participants;
      }
      _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function validateStepFive(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    searchSessionMembers(session.id, 'observer').then(function(members) {
      let errors = {};
      if(_.isEmpty(members)) {
        errors.observers = MESSAGES.errors.fifthStep.observers;
      }
      _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}
