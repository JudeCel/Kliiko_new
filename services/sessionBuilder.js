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
var stringHelpers = require('./../util/stringHelpers');
var sessionValidator = require('./validators/session');
var topicsService = require('./topics');
var resourcesService = require('./resources');
var whiteboardService = require('./whiteboard');

var async = require('async');
var _ = require('lodash');
var q = require('q');
var bluebird = require('bluebird');

const MIN_MAIL_TEMPLATES = 4;
const MAX_STEP_INDEX = 4;
const FIRST_STEP_INDEX = 0;

// Exports
module.exports = {
  messages: MessagesUtil.sessionBuilder,
  initializeBuilder: initializeBuilder,
  findSession: findSession,
  update: update,
  goToStep: goToStep,
  getDestinationStep: getDestinationStep,
  isValidatedWithErrors: isValidatedWithErrors,
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
  return new bluebird(function (resolve, reject) {
    models.AccountUser.findAll({ where: { AccountId: session.accountId, role: { $in: ['admin', 'accountManager'] } } }).then(function(accountUsers) {
      _.map(accountUsers, function(accountUser) {
        sessionMemberServices.createWithTokenAndColour({
          sessionId: session.id,
          accountUserId: accountUser.id,
          username: accountUser.firstName,
          role: 'observer'
        }).then(function(result) {
          resolve(result);
        }, function(error) {
          reject(error);
        });
      });
    }, function(error) {
      reject(error);
    });
  });
}

function defaultTopicParams(session, topic) {
  return {
    topicId: topic.id, 
    sessionId: session.id, 
    order: 0, 
    active: true, 
    landing: true, 
    boardMessage: topic.boardMessage, 
    name: topic.name, 
    sign: topic.sign
  };
}

function defaultVideoParams(resource, topic) {
  return {
    sessionTopicId: topic.id, 
    videoId: resource.id,
    pinboard: false
  };
}

function addDefaultTopic(session, sessionMember) {
  models.Topic.find({ where: { accountId: session.accountId, default: true } }).then(function(topic) {
    if (topic) {
      let topicParams = defaultTopicParams(session, topic);
      models.SessionTopics.create(topicParams).then(function(sessionTopic) {
        let imageParams = whiteboardService.defaultTopicImageParams(sessionTopic, sessionMember);
        models.Shape.create(imageParams);
      });
    }
  });
}

function addDefaultTopicVideo(session) {
  resourcesService.getDefaultVideo(session.type).then(function(resource) {
    if (resource) {
      models.SessionTopics.find({ where: { sessionId: session.id, landing: true } }).then(function(topic) {
        if (topic) {
          let videoParams = defaultVideoParams(resource, topic);
          models.Console.create(videoParams);
          models.SessionResource.create({ sessionId: session.id, resourceId: resource.id });
        }
      });
    }
  });
}

function createNewSessionDefaultItems(session) {
  return new bluebird(function (resolve, reject) {
    addDefaultObservers(session).then(function(sessionMember) {
      addDefaultTopic(session, sessionMember).then(function(sessionMember) {
        resolve();
      }, function(error) {
        resolve();
      });
    }, function(error) {
      resolve();
    }).catch(function(error) {
      resolve();
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
        createNewSessionDefaultItems(session).then(function() {
          sessionBuilderObject(session).then(function(result) {
            deferred.resolve(result);
          }, function(error) {
            deferred.reject(error);
          });
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
    if (session) {
      deferred.resolve(session);
    } else {
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
  setTimeZone(params);
  let snapshot = params.snapshot;
  delete params.snapshot;

  return new bluebird(function (resolve, reject) {
    findSession(sessionId, accountId).then(function(originalSession) {
      isDataValid(snapshot, params, originalSession).then(function(dataValidRes) {
        if (dataValidRes.isValid) {
          doUpdate(originalSession, params).then(function(res) {
            resolve(res);
          }, function(error) {
            reject(error);
          });
        } else {
          resolve({ validation: dataValidRes });
        }
      }, function(error) {
        reject(filters.errors(error));
      });
    }, function(error) {
      reject(filters.errors(error));
    });
  });
}

function doUpdate(originalSession, params) {
  return new bluebird(function (resolve, reject) {
  
    let updatedSession;
    validators.hasValidSubscription(originalSession.accountId).then(function() {
      let count = 0;
      if (params["status"] && params["status"] != originalSession.status && params["status"] == "open") {
        count = 1;
      }
      return validators.subscription(originalSession.accountId, 'session', count, { sessionId: originalSession.id });
    }).then(function() {
      if (params["status"] && params["status"] != originalSession.status) {
        params["step"] = 'manageSessionParticipants';
      }
      return originalSession.updateAttributes(params);
    }).then(function(result) {
      updatedSession = result;
      if (params["type"]) {
        addDefaultTopicVideo(result);
      }      return sessionBuilderObject(updatedSession);
    }).then(function(sessionObject) {
      if (sessionObject.status == 'closed') {
        sendCloseEmailToAllObservers(updatedSession).then(function() {
          resolve(sessionObject);
        }, function(error) {
          reject(error);
        });
      } else {
        validateMultipleSteps(updatedSession, sessionObject.sessionBuilder.steps).then(function(steps) {
          sessionObject.sessionBuilder.steps = steps;
          resolve(sessionObject);
        }, function(error) {
          reject(error);
        });
      }
    }).catch(function(error) {
      reject(filters.errors(error));
    });

  });
}

function isDataValid(snapshot, params, session) {
  return new bluebird(function (resolve, reject) { 
    let oldValueSnapshot = null;
    let currentValueSnapshot = null;
    let currentValue = null;
    let canChange = true;
    let valueFound = false;
    
    for (let i=0; i<constants.sessionBuilderValudateChanges.session.notChangableFields.length; i++) {
      let fieldName = constants.sessionBuilderValudateChanges.session.notChangableFields[i];
      if (params[fieldName]) {
        oldValueSnapshot = snapshot[fieldName];
        currentValue = session[fieldName];
        valueFound = true;
        break;
      }
    }
    if (!valueFound) {
      for (let i=0; i<constants.sessionBuilderValudateChanges.session.changableFields.length; i++) {
        let fieldName = constants.sessionBuilderValudateChanges.session.changableFields[i];
        if (params[fieldName]) {
          oldValueSnapshot = snapshot[fieldName];
          currentValue = session[fieldName];
          valueFound = true;
          break;
        }
      }
    }
    if (valueFound) {
      currentValueSnapshot = stringHelpers.hash(currentValue);
    }

    resolve({ 
      isValid: currentValueSnapshot == dbValueSnapshot, 
      currentValue: currentValue, 
      currentValueSnapshot: currentValueSnapshot,
      canChange:canChange 
    });
  });
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

function goToStep(id, accountId, destinationStep) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    findSession(id, accountId).then(function(session) {
      sessionBuilderObject(session).then(function(sessionObj) {

        validateMultipleSteps(session, sessionObj.sessionBuilder.steps).then(function(steps) {
          sessionObj.sessionBuilder.steps = steps;
          let step = getDestinationStep(sessionObj.sessionBuilder, destinationStep);

          session.updateAttributes({ step: step }).then(function(updatedSession) {
            sessionBuilderObject(updatedSession, steps).then(function(result) {
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
  });

  return deferred.promise;
}

function getDestinationStep(session, destinationStep) {
  let destinationStepIndex = destinationStep - 1;
  let currentStepIndex = constants.sessionBuilderSteps.indexOf(session.currentStep);

  if (destinationStepIndex > MAX_STEP_INDEX || destinationStepIndex < FIRST_STEP_INDEX) {
    destinationStepIndex = currentStepIndex;
  }

  let step = constants.sessionBuilderSteps[destinationStepIndex];

  if (isValidatedWithErrors(currentStepIndex, destinationStepIndex, session.steps)) {
    step = session.currentStep;
  }

  return step;
}

function isValidatedWithErrors(currentStepIndex, destinationStepIndex, steps) {
  if (currentStepIndex < destinationStepIndex) {
    for (let i = currentStepIndex; i < destinationStepIndex; i++) {
      let stepNumber = i + 1;
      let key = "step" + stepNumber;

      if (steps[key].error) {
        return true;
      }
    }
  }

  return false;
}

function openBuild(id, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    findSession(id, accountId).then(function(session) {
      sessionBuilderObject(session).then(function(sessionObj) {
        validateMultipleSteps(session, sessionObj.sessionBuilder.steps).then(function(steps) {
          sessionObj.sessionBuilder.steps = steps;
          deferred.resolve(sessionObj);
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
      let accountUserId = sessionMember.accountUserId;
      sessionMember.destroy().then(function() {
        sessionMemberServices.refreshAccountUsersRole([accountUserId]).then(function() {
          deferred.resolve(MessagesUtil.sessionBuilder.sessionMemberRemoved);
        });
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
    let params = _.map(clUsers, (clUser) => {
      return {
        email: clUser.AccountUser.email,
        accountUserId: clUser.accountUserId,
        sessionId: sessionId,
        role: data.role,
        userId: clUser.userId,
      }
    });
      deferred.resolve(params);
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

function sessionBuilderObjectSnapshotForStep1(stepData) {
  return { 
    name: stringHelpers.hash(stepData.name),
    type: stringHelpers.hash(stepData.name),
    startTime: stringHelpers.hash(stepData.startTime),
    endTime: stringHelpers.hash(stepData.endTime),
    timeZone: stringHelpers.hash(stepData.timeZone),
    resourceId: stringHelpers.hash(stepData.resourceId),
    anonymous: stringHelpers.hash(stepData.anonymous),
    brandProjectPreferenceId: stringHelpers.hash(stepData.brandProjectPreferenceId),
    facilitatorId: stringHelpers.hash(stepData.facilitator ? stepData.facilitator.id : null)
  };
}

function sessionBuilderObjectSnapshotForStep2(stepData) {
  let res = { };
  for (let i=0; i<stepData.topics.length; i++) {
    let topic = stepData.topics[i];
    res[topic.id] = {
      order: stringHelpers.hash(topic.order),
      active: stringHelpers.hash(topic.active),
      landing: stringHelpers.hash(topic.landing),
      boardMessage: stringHelpers.hash(topic.boardMessage),
      name: stringHelpers.hash(topic.name),
      sign: stringHelpers.hash(topic.sign)
    };
  }
  return res;
}

function sessionBuilderObjectSnapshotForStep3(stepData) {
  return { 
    name: stringHelpers.hash(stepData.incentive_details)
  };
  //todo: add emails
}

function sessionBuilderObjectSnapshot(session, steps) {
  switch (session.step) {
    case "setUp":
      return sessionBuilderObjectSnapshotForStep1(steps.step1);
    case "facilitatiorAndTopics":
      return sessionBuilderObjectSnapshotForStep2(steps.step2);
    case "manageSessionEmails":
      return sessionBuilderObjectSnapshotForStep3(steps.step3);
    default:
      return { };
  }
}

function sessionBuilderObject(session, steps) {
  let deferred = q.defer();
  stepsDefinition(session, steps).then(function(result) {
    let sessionBuilder = {
      steps: result,
      currentStep: session.step,
      status: session.status,
      id: session.id,
      startTime: changeTimzone(session.startTime, session.timeZone, "UTC"),
      endTime: changeTimzone(session.endTime, session.timeZone, "UTC"),
      snapshot: sessionBuilderObjectSnapshot(session, result)
    };

    sessionValidator.addShowStatus(sessionBuilder);
    deferred.resolve({
      sessionBuilder: sessionBuilder
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function stepsDefinition(session, steps) {
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
    error: getStepError(steps, "step1")
  };

  object.step2 = {
    stepName: 'facilitatiorAndTopics',
    error: getStepError(steps, "step2")
  };
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
        emailTemplates: [],
        error: getStepError(steps, "step3")
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
            participants: members,
            error: getStepError(steps, "step4")
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
            observers: members,
            error: getStepError(steps, "step5")
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

function getStepError(steps, stepPropertyName) {
  return steps ? steps[stepPropertyName].error : null;
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
          attributes: ['id', 'status', 'emailStatus']
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

function validateMultipleSteps(session, steps) {
  let keys = Object.keys(steps);

  return new bluebird(function (resolve, reject) {
    bluebird.each(keys, (key) => {
      let currentStep = steps[key];
      let params = findCurrentStep(steps, currentStep.stepName);
      params.id = session.id;
      params.accountId = session.accountId;

      return validate(session, params, currentStep.stepName).then(function(error) {
        steps[key].error = error;
      });
    }).then(function() {
      resolve(steps);
    }, function(error) {
      reject(error);
    });
  });
}

function validate(session, params, step) {
  let deferred = q.defer();

  if(!step) {
    step = session.step;
  }

  validators.subscription(session.accountId, 'session', 0, { sessionId: session.id }).then(function() {
    return findValidation(step, params);
  }).then(function(value) {
    deferred.resolve(value);
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
      deferred.resolve(error);
    });
  }
  else if(step == 'facilitatiorAndTopics') {
    validateStepTwo(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.resolve(error);
    });
  }
  else if(step == 'manageSessionEmails') {
    validateStepThree(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.resolve(error);
    });
  }
  else if(step == 'manageSessionParticipants') {
    validateStepFour(params).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.resolve(error);
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
