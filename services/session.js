'use strict';

var policy = require('./../middleware/policy');
var models = require('./../models');
var Session  = models.Session;
var SessionMember  = models.SessionMember;
var AccountUser  = models.AccountUser;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var config = require('config');

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
      findSessionsWithCondition(session.id).then(function(sessions) {
        deferred.resolve(sessions);
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findAllSessions(userId, accountId) {
  let deferred = q.defer();

  if(policy.authorized(['accountManager', 'admin'])) {
    findAllSessionsAsManager(accountId).then(function(sessions) {
      deferred.resolve(sessions);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    findAllSessionsAsMember(userId, accountId).then(function(sessions) {
      deferred.resolve(sessions);
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
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
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
      let facilitator = result.data.SessionMembers[0].dataValues;
      delete facilitator.id;
      delete facilitator.token;
      delete facilitator.sessionId;

      copySessionMember(session, facilitator).then(function(copy) {
        deferred.resolve(simpleParams(copy, MESSAGES.copied));
      }, function(error) {
        deferred.reject(error);
      })
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Untested
function chatRoomUrl(currentDomain) {
  return 'http://' + currentDomain + config.get('server')['baseDomain'] + ':' + config.get('server')['port'] + '/chat/';
}

// Helpers
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
    deferred.resolve(simpleParams(sessions));
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
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
    findSessionsWithCondition(ids).then(function(sessions) {
      deferred.resolve(sessions);
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findSessionsWithCondition(ids) {
  let deferred = q.defer();

  if(_.isArray(ids)) {
    Session.findAll({
      where: { id: { $in: sessionIds } },
      include: [{
        model: SessionMember,
        where: { role: 'facilitator' }
      }]
    }).then(function(sessions) {
      deferred.resolve(simpleParams(sessions));
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
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
        deferred.resolve(simpleParams(session));
      }
      else {
        deferred.reject(MESSAGES.notFound);
      }
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
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
      deferred.reject(prepareErrors(error));
    });
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    let message = n.message.replace(n.path, '');
    if(message == ' cannot be null') {
      message = ' cannot be empty';
    }
    errors[n.path] = _.startCase(n.path) + ':' + message;
  });
  return errors;
};

module.exports = {
  messages: MESSAGES,
  chatRoomUrl: chatRoomUrl,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession
}
