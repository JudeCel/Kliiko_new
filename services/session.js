'use strict';

var policy = require('./../middleware/policy');
var models = require('./../models');
var filters = require('./../models/filters');
var Session  = models.Session;
var SessionMember  = models.SessionMember;
var AccountUser  = models.AccountUser;

var q = require('q');
var _ = require('lodash');

var sessionMemberServices = require('./../services/sessionMember');

const MESSAGES = {
  notFound: 'Session not found',
  removed: 'Session sucessfully removed',
  copied: 'Session sucessfully copied'
};

// Exports
function findSession(sessionId, accountId) {
  let deferred = q.defer();

  Session.find({
    attributes: ['id'],
    where: {
      id: sessionId,
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      where: { role: 'facilitator' }
    }]
  }).then(function(session) {
    if(session) {
      findSessionsWithCondition(session.id, accountId).then(function(data) {
        deferred.resolve(data);
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
      let facilitator = findFacilitator(result.data.SessionMembers);
      if(facilitator) {
        delete facilitator.id;
        delete facilitator.token;
        delete facilitator.sessionId;

        copySessionMember(session, facilitator).then(function(copy) {
          deferred.resolve(simpleParams(copy, MESSAGES.copied));
        }, function(error) {
          deferred.reject(error);
        });
      }
      else {
        deferred.resolve(simpleParams(session, MESSAGES.copied));
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
}

// Helpers
function findFacilitator(members) {
  let facilitator;
  _.map(members, function(member) {
    if(member.role == 'facilitator') {
      return facilitator = member;
    }
  });

  return facilitator ? facilitator.dataValues : null;
}

function findAllSessionsAsManager(accountId) {
  let deferred = q.defer();

  Session.findAll({
    where: {
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      where: { role: 'facilitator' }
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId, deferred);
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
      include: [{
        model: AccountUser,
        where: {
          UserId: userId,
          AccountId: accountId
        }
      }]
    }]
  }).then(function(sessions) {
    let sessionIds = _.map(sessions, 'id');
    findSessionsWithCondition(ids, accountId).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findSessionsWithCondition(ids, accountId) {
  let deferred = q.defer();

  if(_.isArray(ids)) {
    Session.findAll({
      where: { id: { $in: sessionIds } },
      include: [{
        model: SessionMember,
        where: { role: 'facilitator' }
      }]
    }).then(function(sessions) {
      modifySessions(sessions, accountId, deferred);
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }
  else {
    Session.find({
      where: { id: ids },
      include: [{
        model: SessionMember,
        where: { role: 'facilitator' }
      }]
    }).then(function(session) {
      if(session) {
        modifySessions(session, accountId, deferred);
      }
      else {
        deferred.reject(MESSAGES.notFound);
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }

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

function findAccountSubscription(accountId) {
  let deferred = q.defer();

  models.Subscription.find({ where: { AccountId: accountId } }).then(function(subscription) {
    if(subscription) {
      deferred.resolve(subscription);
    }
    else {
      deferred.reject('No subscription found');
    }
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function modifySessions(sessions, accountId, deferred) {
  let array = _.isArray(sessions) ? sessions : [sessions];
  findAccountSubscription(accountId).then(function(subscription) {
    _.map(array, function(session) {
      addShowStatus(session, subscription);
    });
    deferred.resolve(simpleParams(sessions));
  }, function(_error) {
    _.map(array, function(session) {
      addShowStatus(session, null);
    });
    deferred.resolve(simpleParams(sessions));
  });
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

module.exports = {
  messages: MESSAGES,
  chatRoomUrl: chatRoomUrl,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession
}
