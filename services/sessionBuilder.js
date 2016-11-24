'use strict';

var moment = require('moment-timezone');
var models = require('./../models');
var filters = require('./../models/filters');
var Session = models.Session;
var AccountUser = models.AccountUser;

var constants = require('./../util/constants');
var inviteService = require('./invite');
var mailTemplateService = require('./mailTemplate');
var twilioLib = require('./../lib/twilio');
var mailHelper = require('./../mailers/mailHelper');
var mailUrlHelper = require('./../mailers/helpers');
var validators = require('./../services/validators');
var sessionMemberServices = require('./sessionMember');
var MessagesUtil = require('./../util/messages');

var async = require('async');
var _ = require('lodash');
var q = require('q');

const MIN_MAIL_TEMPLATES = 4;

// Exports
module.exports = {
  messages: MessagesUtil.sessionBuilder,
  initializeBuilder: initializeBuilder,
  findSession: findSession,
  update: update,
  nextStep: nextStep,
  prevStep: prevStep,
  openBuild: openBuild,
  destroy: destroy,
  sendSms: sendSms,
  inviteMembers: inviteMembers,
  removeInvite: removeInvite,
  removeSessionMember: removeSessionMember,
  sendGenericEmail: sendGenericEmail,
  sendCloseEmail: sendCloseEmail,
  sessionMailTemplateStatus: sessionMailTemplateStatus,
  canAddObservers: canAddObservers,
  sessionMailTemplateExists: sessionMailTemplateExists
};

function addDefaultObservers(session) {
  models.AccountUser.findAll({ where: { AccountId: session.accountId, role: { $in: ['admin', 'accountManager'] } } }).then(function(accountUsers) {
    _.map(accountUsers, function(accountUser) {
      sessionMemberServices.createWithTokenAndColour({
        sessionId: session.id,
        accountUserId: accountUser.id,
        username: accountUser.firstName,
        role: 'observer'
      });
    });
  });
}

function initializeBuilder(params) {
  let deferred = q.defer();

  validators.hasValidSubscription(params.accountId).then(function() {
    validators.subscription(params.accountId, 'session', 1).then(function() {

      params.step = 'setUp';
      params.startTime = params.date;
      params.endTime = params.date;

      Session.create(params).then(function(session) {
        addDefaultObservers(session, params);
        sessionBuilderObject(session).then(function(result) {
          deferred.resolve(result);
        }, function(error) {
          deferred.reject(error);
        });
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    })
  }, function(error) {
    deferred.reject(error);
  })

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
      deferred.reject(MessagesUtil.sessionBuilder.notFound);
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function changeTimzone(time, from, to ){
  return moment.tz(moment.tz(time, from).format('YYYY-MM-DD HH:mm:ss'), to)
}
function setTimeZone(params) {
  if (params.startTime && params.endTime && params.timeZone) {
    params.startTime = changeTimzone(params.startTime, "UTC", params.timeZone)
    params.endTime = changeTimzone(params.endTime, "UTC", params.timeZone)
  }
}

function update(sessionId, accountId, params) {
  let deferred = q.defer();
  let updatedSession;
  setTimeZone(params)

  validators.hasValidSubscription(accountId).then(function() {
    return validators.subscription(accountId, 'session', 1, { sessionId: sessionId });
  }).then(function() {
    return findSession(sessionId, accountId);
  }).then(function(session) {
    if (params["status"] && params["status"] != session.status) {
      params["step"] = 'manageSessionParticipants';
      params["wasClosed"] = true;
    }
    return session.updateAttributes(params);
  }).then(function(result) {
     updatedSession = result;
    return sessionBuilderObject(updatedSession);
  }).then(function(sessionObject) {
    if (updatedSession.status == 'closed') {
      sendCloseEmailToAllObservers(updatedSession).then(function() {
        deferred.resolve(sessionObject);
      }, function(error) {
        deferred.reject(error);
      });
    } else {
      deferred.resolve(sessionObject);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function sendCloseEmailToAllObservers(session) {
  let deferred = q.defer();

  let where = {
    sessionId: session.id,
    role: "observer"
  };
  sendSessionCloseEmail(session, where).then(function() {
    deferred.resolve();
  },function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function sendCloseEmail(sessionId, data, accountId) {
  let deferred = q.defer();

  findSession(sessionId, accountId).then(function(session) {
    let ids = getEmailRecieversAccountUserIds(data.recievers);
    let where = {
      sessionId: sessionId,
      accountUserId: { $in: ids }
    };
    sendSessionCloseEmail(session, where).then(function(res) {
      deferred.resolve(res);
    },function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function sendSessionCloseEmail(session, where) {
  let deferred = q.defer();

  models.SessionMember.find({
    where: {
      sessionId: session.id,
      role: 'facilitator'
    },
    include: [AccountUser]
  }).then(function(facilitator) {
    if (facilitator) {
      models.SessionMember.findAll({
        where: where,
        include: [AccountUser]
      }).then(function(sessionMembers) {
        if (sessionMembers.length > 0) {
          sendCloseEmailsAsync(sessionMembers, session, facilitator, deferred);
        } else {
          deferred.resolve();
        }
      }).catch(function(error) {
        deferred.reject(error);
      });
    } else {
      deferred.resolve();
    }
  }).catch(function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function sendCloseEmailsAsync(sessionMembers, session, facilitator, deferred) {
  async.each(sessionMembers, function(sessionMember, callback) {

    let emailParams = prepareCloseSessionEmailParams(session, facilitator.AccountUser, sessionMember.AccountUser);
    inviteService.populateMailParamsWithColors(emailParams, session).then(function (emailParamsRes) {
      mailHelper.sendSessionClose(emailParamsRes, function(error, result) {
        if (error) {
          callback(error);
        } else {
          sessionMember.updateAttributes({closeEmailSent: true});
          callback(null, result);
        }
      });
    }, function (error) {
      callback(error);
    });

  }, function(error) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(`Sent ${sessionMembers.length} emails`);
    }
  });
}

function prepareCloseSessionEmailParams(session, facilitator, receiver) {
  return {
    sessionId: session.id,
    sessionName: session.name,
    email: receiver.email,
    role: receiver.role,
    firstName: receiver.firstName, //receiver name
    incentive: session.incentive,
    facilitatorMobileNumber: facilitator.mobile,
    facilitatorFirstName: facilitator.firstName,
    facilitatorLastName: facilitator.lastName,
    facilitatorMail: facilitator.email,
    participateInFutureUrl: "",
    dontParticipateInFutureUrl: "",
    unsubscribeMailUrl: ""
  }
}

function nextStep(id, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    findSession(id, accountId).then(function(session) {
      sessionBuilderObject(session).then(function(sessionObj) {
        let params = findCurrentStep(sessionObj.sessionBuilder.steps, session.step);
        params.id = id;
        params.accountId = accountId;

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
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function prevStep(id, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
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
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function openBuild(id, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    findSession(id, accountId).then(function(session) {
      sessionBuilderObject(session).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

// Untested
function destroy(id, accountId) {
  let deferred = q.defer();

  validators.hasValidSubscription(accountId).then(function() {
    findSession(id, accountId).then(function(session) {
      session.destroy(function(result) {
        deferred.resolve(MessagesUtil.sessionBuilder.cancel);
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function sendSms(data, provider) {
  let deferred = q.defer();
  let numbers = _.map(data.recievers, 'mobile');

  twilioLib.sendSms(numbers, data.message, provider).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Untested
function inviteMembers(sessionId, data, accountId, accountName) {
  let deferred = q.defer();

  findSession(sessionId, accountId).then(function(session) {
    if(session.status == 'closed') {
      deferred.reject(MessagesUtil.sessionBuilder.sessionClosed);
    }
    else {
      return validators.hasValidSubscription(accountId);
    }
  }).then(function() {
    return inviteParams(sessionId, data);
  }).then(function(params) {
    params.accountName = accountName;
    return inviteService.createBulkInvites(params);
  }).then(function(invites) {
    let ids = _.map(invites, 'accountUserId');
    let contactListUsersIds = _.map(data.members, 'listId');
    return findAccountUsersByIds(ids, contactListUsersIds);
  }).then(function(accountUsers) {
    _.map(accountUsers, function(accountUser) {
      accountUser.dataValues.invite = _.last(accountUser.Invites);
    });

    deferred.resolve(accountUsers);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findAccountUsersByIds(ids, contactListUsersIds) {
  return AccountUser.findAll({
    where: {
      id: { $in: ids }
    },
    include: [ models.Invite, {
      model: models.ContactListUser,
      where: { contactListId: { $in: contactListUsersIds } }
    }]
  });
}

function removeSessionMember(params) {
  let deferred = q.defer();

  models.SessionMember.find({
    where: {
      id: params.sessionMemberId,
      sessionId: params.id
    }
  }).then(function(sessionMember) {
    if(sessionMember) {
      sessionMember.destroy().then(function() {
        deferred.resolve(MessagesUtil.sessionBuilder.sessionMemberRemoved);
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MessagesUtil.sessionBuilder.sessionMemberNotFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function removeInvite(params) {
  let deferred = q.defer();

  models.Invite.find({
    where: {
      id: params.inviteId,
      sessionId: params.id
    }
  }).then(function(invite) {
    if(invite) {
      invite.destroy().then(function() {
        deferred.resolve(MessagesUtil.sessionBuilder.inviteRemoved);
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    } else {
      deferred.reject(MessagesUtil.sessionBuilder.inviteNotFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function getSessionParticipant(sessionId, participantType) {
  let deferred = q.defer();
  models.SessionMember.find({
     where: {
       role: participantType
     },
    include: [{
      model: Session,
      where: {
        id: sessionId
      }
    }, {model: AccountUser}]
  }).then(function(participant) {
    deferred.resolve(participant);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function prepareGenericMailParameters(sessionMember, accountUsers, accountId, sessionId) {
  let facilitator = sessionMember.AccountUser;
  let params = [];

  _.map(accountUsers, function(accountUser) {
    params.push({
      accountId: accountId,
      email: accountUser.email,
      firstName: accountUser.firstName,
      facilitatorFirstName: facilitator.firstName,
      facilitatorLastName: facilitator.lastName,
      facilitatorMail: facilitator.email,
      facilitatorMobileNumber: facilitator.mobile,
      unsubscribeMailUrl: mailUrlHelper.getUrl(accountUser.ContactListUsers[0].unsubscribeToken, null, '/unsubscribe/'),
      sessionId: sessionId,
      role: "participant"
    });
  });
  return params;
}

function sendGenericEmailsAsync(params, accountUsers, session, deferred) {
  async.each(params, function(emailParams, callback) {
    inviteService.populateMailParamsWithColors(emailParams, session).then(function (emailParamsRes) {
      mailHelper.sendGeneric(emailParamsRes, function(error, result) {
        if(error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    }, function (error) {
      callback(error);
    });
  }, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(`Sent ${accountUsers.length} emails`);
    }
  });
}

function getEmailRecieversAccountUserIds(recievers) {
  let ids = [];
  for (let i=0; i<recievers.length; i++) {
    let reciever = recievers[i];
    //reciever.id can be AccountUser Id or ContactListUser Id depends on input data from frontend - is it invited or not
    ids.push(reciever.accountUserId || reciever.id);
  }
  return ids;
}

function sendGenericEmail(sessionId, data, accountId) {
  let deferred = q.defer();

  validators.hasValidSubscription(accountId).then(function() {
    getSessionParticipant(sessionId, 'facilitator').then(function(sessionMember) {
      if(sessionMember) {
        let ids = getEmailRecieversAccountUserIds(data.recievers);
        AccountUser.findAll({
          where: {
            id: { $in: ids }
          },
          include: [models.ContactListUser]
        }).then(function(accountUsers) {
          let params = prepareGenericMailParameters(sessionMember, accountUsers, accountId, sessionId);
          findSession(sessionId, accountId).then(function(session) {
            sendGenericEmailsAsync(params, accountUsers, session, deferred);
          }, function(error) {
            deferred.reject(filters.errors(error));
          });
        }).catch(function(error) {
          deferred.reject(filters.errors(error));
        });
      } else {
        deferred.reject(MessagesUtil.sessionBuilder.sessionMemberNotFound);
      }
    }, function (error) {
       deferred.reject(filters.errors(error));
     });
   }, function(error) {
     deferred.reject(filters.errors(error));
   });

  return deferred.promise;
}

// Helpers
function inviteParams(sessionId, data) {
  let deferred = q.defer();
  let ids = _.map(data.members, 'id');

  models.ContactListUser.findAll({
    where: {
      id: { $in: ids }
    },
    include: [models.AccountUser]
  }).then(function(clUsers) {
    let emails = [];
    let accountId = clUsers[0].AccountUser.AccountId;

    let params = _.map(clUsers, function(clUser) {
      emails.push(clUser.AccountUser.email);
      return {
        email: clUser.AccountUser.email,
        accountUserId: clUser.accountUserId,
        sessionId: sessionId,
        role: data.role,
        userId: clUser.userId,
        userType: clUser.AccountUser.UserId ? 'existing' : 'new'
      }
    });

    models.User.findAll({
      where: {
        email: { $in: emails },
      }
    }).then(function(results) {
        console.log(results);
        _.each(results, function(user) {
          _.each(params, function(inviteParam) {
            if(inviteParam.email == user.email) {
              inviteParam.userType = 'existing';
              inviteParam.userId = user.id;
            }
          })
        });

      deferred.resolve(params);
    });

  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findCurrentStep(steps, currentStepName) {
  let output;
  _.map(steps, function(step) {
    if(step.stepName == currentStepName) {
      output = step;
    }
  });

  return output || { stepName: 'done' };
}

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
    type: session.type,
    startTime: changeTimzone(session.startTime, session.timeZone, "UTC"),
    endTime: changeTimzone(session.endTime, session.timeZone, "UTC"),
    timeZone: session.timeZone,
    resourceId: session.resourceId,
    anonymous: session.anonymous,
    brandProjectPreferenceId:  session.brandProjectPreferenceId,
  };

  object.step2 = { stepName: 'facilitatiorAndTopics' };
  async.parallel([
    function(cb) {
      async.parallel(step1Queries(session, object.step1), function(error, _result) {
        cb(error);
      });
    },
    function(cb) {
      async.parallel(step2Queries(session, object.step2), function(error, _result) {
        cb(error);
      });
    },
    function(cb) {
      object.step3 = {
        stepName: 'manageSessionEmails',
        incentive_details: session.incentive_details,
        emailTemplates: []
      };
      cb();
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

function step1Queries(session, step) {
  return [
    function(cb) {
      searchSessionMembers(session.id, 'facilitator').then(function(members) {
        if(!_.isEmpty(members)) {
          step.facilitator = members[0];
        }
        cb();
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    }
  ];
}

function step2Queries(session, step) {
  return [
    function(cb) {
      models.Topic.findAll({
        order: '"SessionTopics.order" ASC, "SessionTopics.topicId" ASC',
        include: [{
          model: models.SessionTopics,
          where: {
            sessionId: session.id
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
  });

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
            sessionId: session.id,
            role: role,
            status: { $ne: 'confirmed' }
          },
          attributes: ['id', 'status']
        }]
      }).then(function(accountUsers) {
        _.map(accountUsers, function(accountUser) {
          accountUser.dataValues.invite = _.last(accountUser.Invites);
        });

        cb(null, members.concat(accountUsers));
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    }
  ];
}

function canAddObservers(accountId) {
  let deferred = q.defer();

  validators.planAllowsToDoIt(accountId, 'canInviteObserversToSession').then(function() {
    deferred.resolve();
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function validate(session, params) {
  let deferred = q.defer();

  validators.subscription(session.accountId, 'session', 1, { sessionId: session.id }).then(function() {
    return findValidation(session.step, params);
  }).then(function() {
    deferred.resolve();
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function findValidation(step, params) {
  let deferred = q.defer();
  if(step == 'setUp') {
    let error = validateStepOne(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
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
    deferred.resolve();
  }
  else {
    deferred.resolve();
  }

  return deferred.promise;
}

function validateStepOne(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    let object = {};
    async.parallel(step1Queries(session, object), function(error, _result) {
      let errors = {};
      if(!params.name) {
        errors.name = MessagesUtil.sessionBuilder.errors.firstStep.nameRequired;
      }

      if (!params.type) {
        errors.type = MessagesUtil.sessionBuilder.errors.firstStep.typeRequired;
      }

      if(!params.startTime) {
        errors.startTime = MessagesUtil.sessionBuilder.errors.firstStep.startTimeRequired;
      }

      if(!params.endTime) {
        errors.endTime = MessagesUtil.sessionBuilder.errors.firstStep.endTimeRequired;
      }

      if(params.startTime > params.endTime) {
        errors.startTime = MessagesUtil.sessionBuilder.errors.firstStep.invalidDateRange;
      }

      if(params.startTime == params.endTime) {
        errors.endTime = MessagesUtil.sessionBuilder.errors.firstStep.invalidEndTime;
      }

      if(!object.facilitator) {
        errors.facilitator = MessagesUtil.sessionBuilder.errors.firstStep.facilitator;
      }

      if (_.isEmpty(errors)) {
        deferred.resolve();
      } else {
        deferred.reject(errors);
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
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

        if(_.isEmpty(object.topics)) {
          errors.topics = MessagesUtil.sessionBuilder.errors.secondStep.topics;
        }

        _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
      }
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function getSessionObjectForMailTemplate(id, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
      findSession(id, accountId).then(function(session) {
        sessionBuilderObject(session).then(function(sessionObj) {
          let response = {sessionObj: sessionObj, session: session};
          deferred.resolve(response);
        }, function(error) {
          deferred.reject(error);
        });
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    })
  return deferred.promise;
}

function prepareCreatedSessionTemplateList(params, templates, deferred) {
  getStepThreeTemplateTypes(params).then(function(uniqueCopies) {
    if(uniqueCopies && uniqueCopies.length) {
      _.forEach(uniqueCopies, function(category) {
        _.forEach(templates, function(template) {
          if(template.category == category) {
            template.created = true;
          }
        });
      })
    }
    deferred.resolve({templates: templates});
  }).catch(function(error) {
    deferred.reject(error);
  });
}

function processSessionObjectForMailTemplate(id, accountId, sessionObj, session, deferred) {
  let params = findCurrentStep(sessionObj.sessionBuilder.steps, session.step);
  params.id = id;
  params.accountId = accountId;
  mailTemplateService.getMailTemplateTypeList(constants.sessionBuilderEmails, function(error, result) {
    if (error) {
      deferred.reject(error);
    } else {
      prepareCreatedSessionTemplateList(params, result, deferred);
    }
  }, function(error) {
      deferred.reject(error);
  });
}

function sessionMailTemplateStatus(id, accountId) {
  let deferred = q.defer();
  getSessionObjectForMailTemplate(id, accountId).then(function(result) {
      processSessionObjectForMailTemplate(id, accountId, result.sessionObj, result.session, deferred);
    }, function(error) {
      deferred.reject(error);
  });
  return deferred.promise;
}

function getStepThreeTemplateTypes(params) {
  let deferred = q.defer();
  let baseTemplateQuery = {category:{ $in: constants.sessionBuilderEmails }};
  let include = [{ model: models.MailTemplateBase, attributes: ['id', 'name', 'systemMessage', 'category'], where: baseTemplateQuery }];

  findSession(params.id, params.accountId).then(function(session) {
    models.MailTemplate.findAll({
      where: {
        sessionId: session.id,
        isCopy: true,
        required: true
      },
      include: include
    }).then(function(templates) {
      let uniqueCopies = [];
      let errors = {};

      _.forEach(constants.sessionBuilderEmails, function(category) {
        _.forEach(templates, function(template) {
          if(template.MailTemplateBase.category == category){
            uniqueCopies.push(template.MailTemplateBase.category);
          }
        });
      })

      uniqueCopies = _.uniq(uniqueCopies);
      deferred.resolve(uniqueCopies);
    }).catch(function(error) {
      deferred.reject(error);
    })
  });

  return deferred.promise;
}

function validateStepThree(params) {
  let deferred = q.defer();
  getStepThreeTemplateTypes(params).then(function(uniqueCopies) {
      let errors = {};
      let filtered = _.filter(uniqueCopies, function(copy) {
        return copy != 'generic';
      });

      if(filtered.length < MIN_MAIL_TEMPLATES){
        errors.emailTemplates = MessagesUtil.sessionBuilder.errors.thirdStep.emailTemplates;
      }
      _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
    }).catch(function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function validateStepFour(params) {
  let deferred = q.defer();

  findSession(params.id, params.accountId).then(function(session) {
    models.Invite.count({
      where:{
        sessionId: session.id,
        role: 'participant'
      }
    }).then(function(count) {
      let errors = {};
      if(count < 1) {
        errors.participants = MessagesUtil.sessionBuilder.errors.fourthStep.participants;
      }
      _.isEmpty(errors) ? deferred.resolve() : deferred.reject(errors);
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function sessionMailTemplateExists(sessionId, accountId, templateName) {
  let deferred = q.defer();

  sessionMailTemplateStatus(sessionId, accountId).then(function(result) {
    var templateExists = false;
    for (var i=0; i<result.templates.length; i++) {
      if (result.templates[i].name == templateName) {
        templateExists = result.templates[i].created;
        break;
      }
    }
    if (templateExists) {
      deferred.resolve()
    } else {
      deferred.reject(templateExists + " email template not saved");
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}
