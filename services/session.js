'use strict';

var MessagesUtil = require('./../util/messages');
var policy = require('./../middleware/policy');
var { Subscription, Session, Invite, SessionMember, AccountUser, Account, SessionType } = require('./../models');
var filters = require('./../models/filters');
var subscriptionService = require('./subscription');
var sessionValidator = require('./validators/session');
var topicsService = require('./topics');
var urlHeplers = require('./urlHeplers');

var q = require('q');
var _ = require('lodash');
var async = require('async');
let Bluebird = require('bluebird');
var MailTemplateService = require('./mailTemplate');

var sessionMemberServices = require('./../services/sessionMember');
var sessionBuilder = require('./../services/sessionBuilder');
var validators = require('./../services/validators');
var sessionTypesConstants = require('./../util/sessionTypesConstants');
var sessionSurvey = require('./sessionSurvey');


const VALID_ATTRIBUTES = {
  sessionMember: ['id', 'role', 'rating', 'sessionId', 'accountUserId', 'username', 'comment']
};

module.exports = {
  messages: MessagesUtil.session,
  chatRoomUrl: chatRoomUrl,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession,
  updateSessionMemberRating: updateSessionMemberRating,
  getAllSessionRatings: getAllSessionRatings,
  changeComment: changeComment,
  getSessionByInvite: getSessionByInvite,
  setAnonymous: setAnonymous,
  canChangeAnonymous: canChangeAnonymous,
  checkSessionByPublicUid: checkSessionByPublicUid,
  setOpen: setOpen
};

function isInviteSessionInvalid(resp) {
  if ( new Date().getTime() < new Date(resp.Session.startTime).getTime() ) return 'Sorry, the '+res.Session.name+' Session is not yet open. Please check the Start Date & Time on your Confirmation email, or contact the Host';
  if ( res.Session.isFull) return 'Sorry, the available places for the '+res.Session.name+' Session have already been filled. The Host will contact you ASAP';
  if ( res.Session.status == "closed") return 'Sorry, the '+res.Session.name+' Session is now closed. For any queries, please contact the Host';

  return null;
}

function setAnonymous(sessionId, accountId) {
  let deferred = q.defer();

  Session.find({
    where: {
      id: sessionId,
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      required: false,
      include: [{model: AccountUser }]
    }]
  }).then(function(session) {
    if(session) {
      if (canChangeAnonymous(session)) {
        session.update({ anonymous: true }).then(function(updatedSession) {
          let promises = _.map(session.SessionMembers, (member) => {
            sessionMemberServices.processSessionMember(member.AccountUser, member, updatedSession, {role: member.role}, q.defer());
          });
          q.allSettled(promises).then(function () {
            deferred.resolve(updatedSession);
          });
        })
      } else {
        deferred.reject(MessagesUtil.session.cannotBeChanged);
      }
    } else {
      deferred.reject(MessagesUtil.session.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function canChangeAnonymous(session) {
  return !session.anonymous && sessionTypesConstants[session.type].features.anonymous.enabled;
}

function setOpen(sessionId, open, accountId) {
  return new Bluebird((resolve, reject) => {
    Session.find({
      where: {
        id: sessionId,
        accountId: accountId
      }
    }).then(function(session) {
      if (session) {
        let status = open ? "open" : "closed";
        session.update({ status: status }).then(function(updatedSession) {
          sessionValidator.addShowStatus(updatedSession);
          resolve({ data: { status: updatedSession.status, showStatus: updatedSession.dataValues.showStatus } });
        });
      } else {
        reject(MessagesUtil.session.notFound);
      }
    }).catch(function(error) {
      reject(filters.errors(error));
    });
  });
}

function getSessionByInvite(token) {
  var deferred = q.defer();
  if (!token) {
    deferred.reject('No invite @token has been provided');
  }

  Invite.find({where:{token:token}, include: [Session]}).then(function(resp) {
    let sessionError = isInviteSessionInvalid(resp);
    if (sessionError) {
      return deferred.reject(sessionError);
    }
    deferred.resolve(resp);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Exports
function changeComment(id, comment, accountId) {
  let deferred = q.defer();

  SessionMember.find({
    where: {
      id: id,
      role: 'participant'
    },
    include: [{
      model: Session,
      where: { accountId: accountId }
    }]
  }).then(function(sessionMember) {
    if (sessionMember) {
      if (sessionMember.Session.status == "closed") {
        sessionMember.update({ comment: comment }).then(function() {
          deferred.resolve(simpleParams(null, MessagesUtil.session.commentChanged));
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      } else {
        deferred.reject(MessagesUtil.session.sessionNotClosed);
      }
    } else {
      deferred.reject(MessagesUtil.session.sessionMemberNotFound);
    }
  });

  return deferred.promise;
}

function findSession(sessionId, accountId) {
  let deferred = q.defer();

  Session.find({
    where: {
      id: sessionId,
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false
    }]
  }).then(function(session) {
    if(session) {
      modifySessions(session, accountId).then(function(result) {
        deferred.resolve(simpleParams(result));
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject(MessagesUtil.session.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessions(userId, accountUser, account) {
  let deferred = q.defer();
  if(policy.hasAccess(accountUser.role, ['accountManager', 'admin'])) {
    findAllSessionsAsManager(account.id).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    findAllSessionsAsMember(userId, account.id).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }

  return deferred.promise;
};

function getAllSessionRatings() {
  let deferred = q.defer();

  Account.findAll({
    attributes: ['id', 'name'],
    include: [{
      model: Session,
      attributes: ['id', 'name'],
      include: [{
        model: SessionMember,
        attributes: ['rating', 'role']
      }]
    }]
  }).then(function(accounts) {
    deferred.resolve(simpleParams(prepareAccountRatings(accounts)));
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function prepareAccountRatings(accounts) {
  let ratings = [];

  _.map(accounts, function(account) {
    let object = { name: account.name, sessions: [], rating: 0 };

    _.map(account.Sessions, function(session) {
      let sObject = { name: session.name, rating: 0 };
      let length = 0;
      _.map(session.SessionMembers, function(member) {
        if(member.role != 'facilitator') {
          length++;
        }

        sObject.rating += member.rating;
      });
      sObject.rating /= (length || 1);

      object.rating += sObject.rating;
      object.sessions.push(sObject);
    });

    if(!_.isEmpty(object.sessions)) {
      object.rating /= object.sessions.length;
      ratings.push(object);
    }
  });

  return ratings;
};

function removeSession(sessionId, accountId) {
  let deferred = q.defer();

    findSession(sessionId, accountId).then(function(result) {
      sessionMemberServices.findAllMembersIds(sessionId).then(function(ids) {
        sessionSurvey.removeSurveys(sessionId).then(function() {
          return result.data.destroy();
        }).then(function() {
          return sessionMemberServices.refreshAccountUsersRole(ids);
        }).then(function() {
          deferred.resolve(simpleParams(null, MessagesUtil.session.removed));
        }).catch(function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

function copySessionTopics(accountId, fromSessionId, toSessionId) {
  let deferred = q.defer();
  topicsService.getAll(accountId).then(function(allTopics) {
    let topicsArray = [];
    allTopics.map(function(topic) {
      topic.SessionTopics.map(function(sessionTopic) {
        if (fromSessionId == sessionTopic.sessionId) {
          topic.sessionTopic = sessionTopic;
          topic.sessionTopic.sessionId = toSessionId;
          topicsArray.push(topic);
        }
      });
    });

    topicsService.updateSessionTopics(toSessionId, topicsArray).then(function(successResponse) {
      deferred.resolve(successResponse);
    }, function(failureResponse) {
      deferred.reject(failureResponse);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function copySession(sessionId, accountId) {
  let deferred = q.defer();

  validators.subscription(accountId, 'session', 0).then(function() {
    findSession(sessionId, accountId).then(function(result) {
      let facilitator = result.data.dataValues.facilitator;
      delete result.data.dataValues.id;
      delete result.data.dataValues.facilitator;
      delete result.data.dataValues.status;
      delete result.data.dataValues.anonymous;
      delete result.data.dataValues.resourceId;
      delete result.data.dataValues.brandProjectPreferenceId;
      delete result.data.dataValues.startTime;
      delete result.data.dataValues.endTime;
      delete result.data.dataValues.isVisited;
      result.data.dataValues.isInactive = true;
      result.data.dataValues.name = "Copy of (" + result.data.dataValues.name + ")";
      result.data.dataValues.step = "setUp";
      Session.create(result.data.dataValues).then(function(session) {
        async.waterfall([
            function (callback) {
              copySessionTopics(accountId, sessionId, session.id).then(function(successResponse) {
                callback();
              }, function(errorResponse) {
                //we ignore error because data is copied step by step, and one error shouldn't stop following copying
                callback();
              });
            },
            function(callback) {
              sessionSurvey.copySurveys(sessionId, session.id, accountId).then(() => {
                console.log("----success copying survey");
                callback();
              }).catch((e) => {
                callback();
                console.log("----failed copying survey", e);
              })
            }
            //  NOTE: right now we need to disable this functionality.
            //  When client will want to copy email templates we will jsut need to add this code back.
            // function(callback) {
            //   MailTemplateService.copyTemplatesFromSession(accountId, sessionId, session.id, function(error, result) {
            //     callback();
            //   });
            // }
        ], function (error) {
          //we ignore error in callback because data is copied step by step, and one error shouldn't stop following copying
          prepareModifiedSessions(session, accountId, deferred);
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
};

function prepareModifiedSessions(session, accountId, deferred) {
  findSession(session.id, session.accountId).then(function(result) {
    modifySessions(result.data, accountId).then(function(result) {
      deferred.resolve(simpleParams(result, MessagesUtil.session.copied));
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });
}

function chatRoomUrl() {
  return '/chat/';
};

function updateSessionMemberRating(params, userId, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    SessionMember.find({
      where: {
        id: params.id,
        role: 'participant'
      },
      attributes: VALID_ATTRIBUTES.sessionMember,
      returning: true,
      include: [Session]
    }).then(function(member) {
      if (member) {
        if (member.Session.status == "closed") {
          AccountUser.find({
            where: {
              id: member.accountUserId,
              UserId: userId,
              AccountId: accountId
            }
          }).then(function(accountUser) {
            if (accountUser) {
              deferred.reject(MessagesUtil.session.cantRateSelf);
            } else {
              member.update({ rating: params.rating }, { returning: true }).then(function(sessionMember) {
                deferred.resolve(simpleParams(member, MessagesUtil.session.rated));
              }).catch(function(error) {
                deferred.reject(filters.errors(error));
              });
            }
          });
        } else {
          deferred.reject(MessagesUtil.session.sessionNotClosed);
        }
      } else {
        deferred.reject(MessagesUtil.session.sessionMemberNotFound);
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

// Helpers
function findFacilitator(members) {
  let facilitator = {};
  _.map(members, function(member, index) {
    if(member.role == 'facilitator') {
      return facilitator = member;
    }
  });

  return facilitator.dataValues;
}

function findAllSessionsAsManager(accountId) {
  let deferred = q.defer();
  Session.findAll({
    where: {
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false,
      include: [{
        model: AccountUser,
        attributes: ['firstName', 'lastName', 'email']
      }]
    }, {
      model: SessionType,
      attributes: ['name', 'properties']
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessionsAsMember(userId, accountId) {
  let deferred = q.defer();
  Session.findAll({
    where: {
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      include: [{
        model: AccountUser,
        where: {
          UserId: userId,
          AccountId: accountId
        }
      }]
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function copySessionMember(session, facilitator) {
  let deferred = q.defer();
  facilitator.sessionId = session.id;
  sessionMemberServices.createWithTokenAndColour(facilitator).then(function(sessionMember) {
     deferred.resolve();
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function simpleParams(data, message) {
  return {
    data: data,
    message: message,
    baseUrl: urlHeplers.getBaseUrl()
  };
};

function modifySessions(sessions, accountId) {
  let deferred = q.defer();

  Account.find({
    where: { id: accountId },
    include: [Subscription]
  }).then(function(account) {
    changeSessionData(sessions, account.admin ? null : account.Subscription.endDate);
    deferred.resolve(sessions);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function changeSessionData(sessions, subscriptionEndDate) {
  let array = _.isArray(sessions) ? sessions : [sessions];
  _.map(array, function(session) {
    sessionValidator.addShowStatus(session, subscriptionEndDate);

    let facilitator = findFacilitator(session.SessionMembers);
    if(facilitator) {
      let facIndex;

      session.dataValues.facilitator = facilitator;
      let total = 0;
      _.map(session.SessionMembers, function(member, index) {
        if(member.id == facilitator.id) {
          facIndex = index;
        }
        else {
          total += member.rating;
        }
      });
      session.SessionMembers.splice(facIndex, 1);
      session.dataValues.averageRating = total / session.SessionMembers.length;
    }
  });
}

function checkSessionByPublicUid(uid) {
  return new Bluebird((resolve, reject) => {
    Session.find({
      where: {
        publicUid: uid
      }
    }).then(function(session) {
      if (session && sessionTypesConstants[session.type].features.ghostParticipants.enabled) {
        if (session.status == "open") {
          resolve(session);
        } else {
          reject(MessagesUtil.session.closed.replace("sessionName", session.name));
        }
      } else {
        reject(MessagesUtil.session.notFound);
      }
    }, function(error) {
      reject(error);
    });
  });
}
