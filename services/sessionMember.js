'use strict';

var {Account, Session, AccountUser, SessionMember} = require('./../models');
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
  isCloseEmailSentToSessionMember: isCloseEmailSentToSessionMember,
  findOrCreate: findOrCreate,
  addDefaultObserver: addDefaultObserver,
  createGhost: createGhost
};

function createGhost(name, session) {
  return new Bluebird((resolve, reject) => {
    if (name) {
      SessionMember.count({ where: { sessionId: session.id, role: 'participant'} }).then(function(count) {
        let params = ghostUserParams(name, session.id, count);
        return SessionMember.create(params);
      }, function(error) {
        reject(error);
      });
    } else{
      reject(MessagesUtil.sessionMember.nameEmpty);
    }
  });
}

function ghostUserParams(name, sessionId, count) {
  let participantColors = brandProjectConstants.memberColours.participants;
  let length = Object.keys(participantColors).length;
  let colour = participantColors[(count % length) + 1];

  return {
    sessionId: sessionId,
    accountUserId: null,
    username: name,
    role: 'participant',
    typeOfCreation: 'system',
    avatarData: constants.sessionMemberNoGender,
    token: uuid.v1(),
    colour: colour,
    ghost: true
  };
}

function addDefaultObserver({id}, session, defaultSystemMemberRoles) {
  return new Bluebird((resolve, reject) => {
    AccountUser.find({
      where: {id: id},
      role: { $in: defaultSystemMemberRoles},
      include: [{model: SessionMember, required: false, where: {id: session.id}}]
    }).then((accountUser) => {
      if (_.isEmpty(accountUser.SessionMembers)) {
        createWithTokenAndColour({
          sessionId: session.id,
          accountUserId: accountUser.id,
          username: accountUser.firstName,
          role: 'observer',
          typeOfCreation: 'system'
        }).then((sessionMember) => {
          resolve(sessionMember);
        }, (error) => {
          reject(error);
        });
      }
    }, (error) => {
      reject();
    });
  });
}

function findOrCreate(userId, sessionId) {
  return new Bluebird((resolve, reject) => {
    Session.find({where: {id: sessionId},
      include: [{model: Account,
        include: [{
          model: AccountUser,
          include: [{model: SessionMember, required: false, where: { sessionId: sessionId }}],
          required: true,
          where: {
            UserId: userId
          }
        }]
      }]
    })
    .then((session) => {
      if (!session) { return reject(MessagesUtil.lib.jwt.notPart)}

      let accountUser = session.Account.AccountUsers[0]
      if (accountUser.SessionMembers[0]) {
        resolve(accountUser.SessionMembers[0])
      }else{
        let defaultSystemMemberRoles = ['accountManager', 'admin']
        if (_.includes(defaultSystemMemberRoles, accountUser.role)) {
          addDefaultObserver(accountUser, session, defaultSystemMemberRoles).then((sessionMember) => {
            resolve(sessionMember);
          }, (error) => {
            reject(MessagesUtil.lib.jwt.notPart);
          })
        }else{
          reject(MessagesUtil.lib.jwt.notPart);
        }
      }
    }, (error) => {
      reject(error);
    });
  });
}
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

    if (!sessionMemberParams.typeOfCreation) {
      sessionMemberParams.typeOfCreation = 'invite'
    }
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
        sessionMember.update({ role: 'observer', typeOfCreation: 'system' });
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
