'use strict';

var policy = require('./../middleware/policy');
var models = require('./../models');
var filters = require('./../models/filters');
var Session  = models.Session;
var SessionMember  = models.SessionMember;
var AccountUser  = models.AccountUser;
var Account  = models.Account;

var q = require('q');
var _ = require('lodash');

var sessionMemberServices = require('./../services/sessionMember');

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
  getAllSessionRatings: getAllSessionRatings
};

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

getAllSessionRatings();
function getAllSessionRatings() {
  let deferred = q.defer();

Account.findAll({
    group: ["Account.name", "Account.id", "Sessions.id", "Sessions.name"],
    attributes: ['name', 'id'],
    include: [
      {
        model: Session, attributes: ['name', [models.sequelize.fn('avg', models.sequelize.col('Sessions.SessionMembers.rating')), "rating"]],
        include: [
          {model: SessionMember, attributes:[]}]
        }]
  }).then(function(data) {
    deferred.resolve(simpleParams(data));
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
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

  findSession(sessionId, accountId).then(function(result) {
    delete result.data.dataValues.id;

    Session.create(result.data.dataValues).then(function(session) {
      let facilitator = result.data.dataValues.facilitator;
      if(facilitator) {
        delete facilitator.id;
        delete facilitator.token;
        delete facilitator.sessionId;

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

  return deferred.promise;
};

function chatRoomUrl() {
  return '/chat/';
};

function updateSessionMemberRating(params, userId, accountId) {
  let deferred = q.defer();

  SessionMember.find({
    where: {
      id: params.id
    },
    include: [{
      model: AccountUser,
      where: {
        UserId: { $ne: userId },
        AccountId: { $ne: accountId }
      }
    }],
    attributes: VALID_ATTRIBUTES.sessionMember,
    returning: true
  }).then(function(result) {
    if(result) {
      result.update({ rating: params.rating }, { returning: true }).then(function(sessionMember) {
        deferred.resolve(simpleParams(result, MESSAGES.rated));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MESSAGES.cantRateSelf);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

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

  session.createSessionMember(facilitator).then(function(result) {
    sessionMemberServices.createToken(result.id).then(function() {
      findSession(session.id, session.accountId).then(function(result) {
        deferred.resolve(result.data);
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

function modifySessions(sessions, accountId) {
  let deferred = q.defer();

  models.Subscription.find({ where: { AccountId: accountId } }).then(function(subscription) {
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
    else if(date < new Date(session.start_time)) {
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
