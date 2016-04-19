'use strict';

var policy = require('./../middleware/policy');
var models = require('./../models');
var filters = require('./../models/filters');
var Session  = models.Session;
var Invite  = models.Invite;
var SessionMember  = models.SessionMember;
var AccountUser  = models.AccountUser;
var Account  = models.Account;

var q = require('q');
var _ = require('lodash');

var sessionMemberServices = require('./../services/sessionMember');
var validators = require('./../services/validators');


const VALID_ATTRIBUTES = {
  sessionMember: ['id', 'role', 'rating', 'sessionId', 'accountUserId', 'username']
};

const MESSAGES = {
  notFound: 'Session not found',
  removed: 'Session sucessfully removed',
  copied: 'Session sucessfully copied',
  sessionMemberNotFound: 'Session Member not found',
  rated: 'Session Member rated',
  cantRateSelf: "You can't rate your self"
};

module.exports = {
  messages: MESSAGES,
  chatRoomUrl: chatRoomUrl,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession,
  updateSessionMemberRating: updateSessionMemberRating,
  getAllSessionRatings: getAllSessionRatings,
  addShowStatus: addShowStatus,
  getSessionByInvite: getSessionByInvite
};

function isInviteSessionInvalid(resp) {
  if ( new Date().getTime() < new Date(resp.Session.startTime).getTime() ) return 'Sorry, the '+res.Session.name+' Session is not yet open. Please check the Start Date & Time on your Confirmation email, or contact the Facilitator';
  if ( res.Session.isFull) return 'Sorry, the available places for the '+res.Session.name+' Session have already been filled. The Facilitator will contact you ASAP';
  if ( !res.Session.active) return 'Sorry, the '+res.Session.name+' Session is now closed. For any queries, please contact the Facilitator';

  return null;
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
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessions(userId, domain) {
  let deferred = q.defer();
  if(policy.hasAccess(domain.roles, ['accountManager', 'admin'])) {
    findAllSessionsAsManager(domain.id).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    findAllSessionsAsMember(userId, accountId).then(function(data) {
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
        attributes: ['rating']
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
      _.map(session.SessionMembers, function(member) {
        sObject.rating += member.rating;
      });

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
      result.data.destroy().then(function() {
        deferred.resolve(simpleParams(null, MESSAGES.removed));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

function copySession(sessionId, accountId) {
  let deferred = q.defer();

  validators.hasValidSubscription(accountId).then(function() {
    validators.subscription(accountId, 'session', 1).then(function() {
      findSession(sessionId, accountId).then(function(result) {
        delete result.data.dataValues.id;

        Session.create(result.data.dataValues).then(function(session) {
          let facilitator = result.data.dataValues.facilitator;
          if(facilitator) {
            delete facilitator.id;
            delete facilitator.token;

            // Not confirmed.
            copySessionMember(session, facilitator).then(function(copy) {
              modifySessions(copy, accountId).then(function(result) {
                deferred.resolve(simpleParams(result, MESSAGES.copied));
              }, function(error) {
                deferred.reject(error);
              });
            }, function(error) {
              deferred.reject(error);
            });
          }
          else {
            modifySessions(session, accountId).then(function(result) {
              deferred.resolve(simpleParams(result, MESSAGES.copied));
            }, function(error) {
              deferred.reject(error);
            });
          }
        }).catch(function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    })
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

function chatRoomUrl() {
  return '/chat/';
};

function updateSessionMemberRating(params, userId, accountId) {
  let deferred = q.defer();

  validators.hasValidSubscription(accountId).then(function() {
    SessionMember.find({
      where: {
        id: params.id
      },
      attributes: VALID_ATTRIBUTES.sessionMember,
      returning: true
    }).then(function(member) {
      if(member) {
        AccountUser.find({
          where: {
            id: member.accountUserId,
            UserId: userId,
            AccountId: accountId
          }
        }).then(function(accountUser) {
          if(accountUser) {
            deferred.reject(MESSAGES.cantRateSelf);
          }
          else {
            member.update({ rating: params.rating }, { returning: true }).then(function(sessionMember) {
              deferred.resolve(simpleParams(member, MESSAGES.rated));
            }).catch(function(error) {
              deferred.reject(filters.errors(error));
            });
          }
        });
      }
      else {
        deferred.reject(MESSAGES.sessionMemberNotFound);
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
      required: false
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
    attributes: ['id'],
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

  sessionMemberServices.createWithTokenAndColour(facilitator).then(function() {
    findSession(session.id, session.accountId).then(function(result) {
      deferred.resolve(result.data);
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

function modifySessions(sessions, accountId) {
  let deferred = q.defer();

  models.Subscription.find({ where: { accountId: accountId } }).then(function(subscription) {
    let array = _.isArray(sessions) ? sessions : [sessions];
    _.map(array, function(session) {
      addShowStatus(session, subscription);
      let facilitator = findFacilitator(session.SessionMembers);
      if(facilitator) {
        let facIndex;

        session.dataValues.facilitator = facilitator;
        _.map(session.SessionMembers, function(member, index) {
          if(member.id == facilitator.id) {
            facIndex = index;
          }
        });
        session.SessionMembers.splice(facIndex, 1);
      }
    });

    deferred.resolve(sessions);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function addShowStatus(session, subscription) {
  if(session.active) {
    var date = new Date();
    if(subscription && date > subscription.trialEnd) {
      session.dataValues.showStatus = 'Expired';
    }
    else if(date < new Date(session.startTime)) {
      session.dataValues.showStatus = 'Pending';
    }
    else {
      session.dataValues.showStatus = 'Open';
    }
  }
  else {
    session.dataValues.showStatus = 'Closed';
  }
}
