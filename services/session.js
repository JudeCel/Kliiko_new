'use strict';

var MessagesUtil = require('./../util/messages');
var policy = require('./../middleware/policy');
var { Subscription, Session, Invite, SessionMember, AccountUser, Account } = require('./../models');
var filters = require('./../models/filters');
var subscriptionService = require('./subscription');
var sessionValidator = require('./validators/session');
var topicsService = require('./topics');

var q = require('q');
var _ = require('lodash');
var async = require('async');
let Bluebird = require('bluebird');
var MailTemplateService = require('./mailTemplate');

var sessionMemberServices = require('./../services/sessionMember');
var sessionBuilder = require('./../services/sessionBuilder');
var validators = require('./../services/validators');


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
  canChangeAnonymous: canChangeAnonymous
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
      }else{
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
  if (session.anonymous == true) { return false };
  return true;
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

function findSession(sessionId, accountId, provider) {
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
      modifySessions(session, accountId, provider).then(function(result) {
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

function findAllSessions(userId, accountUser, account, provider) {
  let deferred = q.defer();
  if(policy.hasAccess(accountUser.role, ['accountManager', 'admin'])) {
    findAllSessionsAsManager(account.id, provider).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    findAllSessionsAsMember(userId, account.id, provider).then(function(data) {
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

function removeSession(sessionId, accountId, provider) {
  let deferred = q.defer();

    findSession(sessionId, accountId, provider).then(function(result) {
      sessionMemberServices.findAllMembersIds(sessionId).then(function(ids) {
        result.data.destroy().then(function() {
          sessionMemberServices.refreshAccountUsersRole(ids).then(function() {
            deferred.resolve(simpleParams(null, MessagesUtil.session.removed));
          });
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

function copySession(sessionId, accountId, provider) {
  let deferred = q.defer();

  validators.subscription(accountId, 'session', 1).then(function() {
    findSession(sessionId, accountId, provider).then(function(result) {
      let facilitator = result.data.dataValues.facilitator;
      delete result.data.dataValues.id;
      delete result.data.dataValues.facilitator;
      delete result.data.dataValues.status;
      delete result.data.dataValues.type;
      delete result.data.dataValues.anonymous;
      delete result.data.dataValues.resourceId;
      delete result.data.dataValues.brandProjectPreferenceId;
      delete result.data.dataValues.startTime;
      delete result.data.dataValues.endTime;
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
              MailTemplateService.copyTemplatesFromSession(accountId, sessionId, session.id, function(error, result) {
                callback();
              });
            }
        ], function (error) {
          //we ignore error in callback because data is copied step by step, and one error shouldn't stop following copying
          prepareModifiedSessions(session, accountId, provider, deferred);
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

function prepareModifiedSessions(session, accountId, provider, deferred) {
  findSession(session.id, session.accountId, provider).then(function(result) {
    modifySessions(result.data, accountId, provider).then(function(result) {
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

function findAllSessionsAsManager(accountId, provider) {
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
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId, provider).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessionsAsMember(userId, accountId, provider) {
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
    modifySessions(sessions, accountId, provider).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function copySessionMember(session, facilitator, provider) {
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
  return { data: data, message: message };
};

function modifySessions(sessions, accountId, provider) {
  let deferred = q.defer();

  Account.find({ where: { id: accountId } }).then(function(account) {
    if(account.admin) {
      changeSessionData(sessions, null, provider);
      deferred.resolve(sessions);
    }
    else {
      Subscription.find({ where: { accountId: accountId } }).then(function(subscription) {
        subscriptionService.getChargebeeSubscription(subscription.subscriptionId, provider).then(function(chargebeeSub) {
          changeSessionData(sessions, chargebeeSub, provider);
          deferred.resolve(sessions);
        }, function(error) {
          deferred.reject(error);
        })
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  })


  return deferred.promise;
}

function changeSessionData(sessions, chargebeeSub, provider) {
  let array = _.isArray(sessions) ? sessions : [sessions];
  _.map(array, function(session) {
    sessionValidator.addShowStatus(session, chargebeeSub);

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
