'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var brandProjectConstants = require('../util/brandProjectConstants');
var constants = require('./../util/constants');
var MessagesUtil = require('./../util/messages');

var Session = models.Session;
var SessionMember = models.SessionMember;

var q = require('q');
var _ = require('lodash');
var uuid = require('node-uuid');

module.exports = {
  createToken: createToken,
  removeByIds: removeByIds,
  removeByRole: removeByRole,
  createWithTokenAndColour: createWithTokenAndColour,
  messages: MessagesUtil.sessionMember
};

function createWithTokenAndColour(params) {
  let deferred = q.defer();

  params.token = params.token || uuid.v1();

  models.AccountUser.find({ where: { id: params.accountUserId } }).then(function(accountUser) {
    params.avatarData = accountUser.gender == 'male' ? constants.sessionMemberMan : constants.sessionMemberWoman;

    SessionMember.find({ where: { sessionId: params.sessionId, accountUserId: params.accountUserId } }).then(function(sessionMember) {
      let correctFunction = createHelper;
      if(sessionMember) {
        correctFunction = updateHelper;
      }

      if(params.role == 'facilitator' || params.role == 'observer') {
        params.colour = brandProjectConstants.memberColours.facilitator;
        correctFunction(deferred, params, sessionMember);
      }
      else {
        SessionMember.count({
          where: {
            sessionId: params.sessionId,
            role: params.role
          }
        }).then(function(c) {
          params.colour = brandProjectConstants.memberColours.participants[c+1];
          correctFunction(deferred, params, sessionMember);
        });
      }
    });
  });

  return deferred.promise;
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

  SessionMember.destroy({
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
  }).then(function(removedCount) {
    deferred.resolve(removedCount);
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
    }, models.AccountUser]
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
    SessionMember.destroy({ where: { id: ids } }).then(function(removedCount) {
      _.map(managers, function(sessionMember) {
        sessionMember.update({ role: 'observer' });
      });

      deferred.resolve(removedCount);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};
