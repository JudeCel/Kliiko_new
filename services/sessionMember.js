'use strict';

var {Session, AccountUser, SessionMember} = require('./../models');
var filters = require('./../models/filters');
var brandProjectConstants = require('../util/brandProjectConstants');
var constants = require('./../util/constants');
var anonymousWord = require('./../util/anonymousWord');
var MessagesUtil = require('./../util/messages');

var q = require('q');
var _ = require('lodash');
var uuid = require('node-uuid');
var Bluebird = require('bluebird');
var async = require('async');

module.exports = {
  createToken: createToken,
  removeByIds: removeByIds,
  removeByRole: removeByRole,
  createWithTokenAndColour: createWithTokenAndColour,
  messages: MessagesUtil.sessionMember,
  processSessionMember: processSessionMember,
  refreshAccountUsersRole: refreshAccountUsersRole,
  findAllMembersIds: findAllMembersIds,
  getSessionMembers: getSessionMembers,
  isCloseEmailSentToSessionMember: isCloseEmailSentToSessionMember
};

function createWithTokenAndColour(params) {
  let deferred = q.defer();
  params.token = params.token || uuid.v1();

  AccountUser.find({ where: { id: params.accountUserId }, transaction: params.t }).then(function(accountUser) {
    SessionMember.find({ where: { sessionId: params.sessionId, accountUserId: params.accountUserId }, transaction: params.t }).then(function(sessionMember) {
      Session.find({ where: { id: params.sessionId} }).then(function(session) {
        processSessionMember(accountUser, sessionMember, session, params, deferred)
      });
    });
  });
  return deferred.promise;
}

function setMemberUserName(params, session) {
  let deferred = q.defer();
  SessionMember.findAll({ where: { sessionId: session.id, role: params.role },
    attributes: ['username'], transaction: params.t
  }).then((sessionMembers) => {
    if (session.anonymous && params.role == 'participant') {
      anonymousWord.parseFile().then((result) => {
        anonymousWord.getWord(_.map(sessionMembers, (sm) => {return sm.username} ), result).then((name) => {
          params.username = name;
          deferred.resolve({sessionMemberParams: params, memberCount: sessionMembers.length});
        })
      })
    }else{
      deferred.resolve({sessionMemberParams: params, memberCount: sessionMembers.length});
    }
  })
  return deferred.promise;
}
function processSessionMember(accountUser, sessionMember, session, params, deferred) {
  let correctFunction = null;

  setMemberUserName(params, session).then((newParams) => {
    let sessionMemberParams = newParams.sessionMemberParams
    let memberCount = newParams.memberCount

    if(sessionMember) {
      correctFunction = updateHelper;
    }else{
      correctFunction = createHelper;

      params.avatarData = getAvatarData(accountUser.gender);
      if(sessionMemberParams.role == 'participant') {
        let participants = brandProjectConstants.memberColours.participants;
        let length = Object.keys(participants).length;
        sessionMemberParams.colour = participants[(memberCount % length) + 1];
      } else {
        sessionMemberParams.colour = brandProjectConstants.memberColours.facilitator;
      }
    }
    correctFunction(deferred, sessionMemberParams, sessionMember);
  })

}

function getAvatarData(gender) {
  if (gender == 'male') {
    return constants.sessionMemberMan;
  } else if (gender == 'female') {
    return constants.sessionMemberWoman;
  } else {
    return constants.sessionMemberNoGender;
  }
}

function updateHelper(deferred, params, sessionMember) {
  sessionMember.update(params, { returning: true, transaction: params.t }).then(function(sm) {
    deferred.resolve(sm);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });
}

function createHelper(deferred, params) {
  SessionMember.create(params, { transaction: params.t }).then(function(sessionMember) {
    deferred.resolve(sessionMember);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });
}

function createToken(id) {
  let deferred = q.defer();
  let params = { token: uuid.v1() };

  SessionMember.update(params, {
    where: { id: id },
    returning: true
  }).then(function(result) {
    if(result[0] > 0) {
      deferred.resolve(result[1][0]);
    }
    else {
      deferred.reject(MessagesUtil.sessionMember.notFound);
    }
  });

  return deferred.promise;
}

function removeByIds(ids, sessionId, accountId) {
  let deferred = q.defer();

  let where = {
    where: {
      sessionId: sessionId,
      id: { $in: ids }
    },
    include: [{
      model: Session,
      where: {
        accountId: accountId
      }
    }]
  };

  SessionMember.findAll(where).then(function(sessionMembers) {
    let accountUserIds = _.map(sessionMembers, 'accountUserId');
    SessionMember.destroy(where).then(function(removedCount) {
      refreshAccountUsersRole(accountUserIds).then(function() {
        deferred.resolve(removedCount);
      });
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function removeByRole(role, sessionId, accountId) {
  let deferred = q.defer();

  SessionMember.findAll({
    where: {
      sessionId: sessionId,
      role: role
    },
    include: [{
      model: Session,
      where: {
        accountId: accountId
      }
    }, AccountUser]
  }).then(function(sessionMembers) {
    let members = [], managers = [];
    _.map(sessionMembers, function(sessionMember) {
      if(sessionMember.AccountUser.role == 'accountManager') {
        managers.push(sessionMember);
      }
      else {
        members.push(sessionMember);
      }
    });

    let ids = _.map(members, 'id');
    let accountUserIds = _.map(members, 'accountUserId');
    SessionMember.destroy({ where: { id: ids } }).then(function(removedCount) {
      _.map(managers, function(sessionMember) {
        sessionMember.update({ role: 'observer' });
      });
      refreshAccountUsersRole(accountUserIds).then(function() {
        deferred.resolve(removedCount);
      });
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllMembersIds(sessionId) {
  return new Bluebird(function (resolve, reject) {
    SessionMember.findAll({
      where: {
        sessionId: sessionId
      }
    }).then(function(sessionMembers) {
      let ids = _.map(sessionMembers, 'accountUserId');
      resolve(ids);
    }, function(error) {
      reject(error);
    });
  });
}

function refreshAccountUsersRole(ids) {
  return new Bluebird(function (resolve, reject) {
    AccountUser.findAll({
      where: {
        id: { $in: ids },
        role: { $in: ["facilitator", "participant", "observer"] }
      },
      include: [{
        model: SessionMember
      }]
    }).then(function(accountUsers) {
      refreshAccountUsersRoleAsync(accountUsers, resolve, reject);
    }, function(error) {
      reject(error);
    });
  });
}

function refreshAccountUsersRoleAsync(accountUsers, resolve, reject) {
  async.each(accountUsers, function(accountUser, callback) {

    let role = "observer";
    for (let i=0; i<accountUser.SessionMembers.length; i++) {
      let sessionMember = accountUser.SessionMembers[i];
      if (sessionMember.role == "participant" && role == "observer") {
        role = "participant";
      } else if (sessionMember.role == "facilitator") {
        role = "facilitator";
        break;
      }
    }
    if (role != accountUser.role) {
      accountUser.updateAttributes({role: role}).then(function() {
        callback(null);
      }).catch(function(error) {
        callback(error);
      });
    } else {
      callback(null);
    }

  }, function(error) {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
}

function getSessionMembers(sessionId, acountUserIds) {
  return new Bluebird(function (resolve, reject) {
    SessionMember.findAll({
      where: {
        sessionId: sessionId,
        accountUserId: { $in: acountUserIds }
      }
    }).then(function(sessionMembers) {
      resolve(sessionMembers);
    }, function(error) {
      reject(error);
    });
  });
}

function isCloseEmailSentToSessionMember(acountUserId, sessionId) {
  return new Bluebird(function (resolve, reject) {
    SessionMember.find({
      where: {
        accountUserId: acountUserId,
        sessionId: sessionId,
        closeEmailSent: true
      }
    }).then(function(sessionMember) {
      if(sessionMember) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, function(error) {
      reject(error);
    });
  });
}
