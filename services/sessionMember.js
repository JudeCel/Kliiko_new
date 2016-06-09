'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var brandProjectConstants = require('../util/brandProjectConstants');
var constants = require('./../util/constants');

var Session = models.Session;
var SessionMember = models.SessionMember;

var q = require('q');
var _ = require('lodash');
var uuid = require('node-uuid');

const MESSAGES = {
  notFound: 'Session Member not Found with Id: ',
  wrongSessionId: 'Wrong Session id provided: '
};

module.exports = {
  createToken: createToken,
  removeByIds: removeByIds,
  removeByRole: removeByRole,
  createWithTokenAndColour: createWithTokenAndColour,
  messages: MESSAGES
};

function createWithTokenAndColour(params) {
  let deferred = q.defer();

  params.token = params.token || uuid.v1();

  models.AccountUser.find({ where: { id: params.accountUserId } }).then(function(accountUser) {
    params.avatarData = accountUser.gender == 'male' ? constants.sessionMemberMan : constants.sessionMemberWoman;

    if(params.role == 'facilitator' || params.role == 'observer') {
      params.colour = brandProjectConstants.memberColours.facilitator;
      createHelper(deferred, params);
    }
    else {
      SessionMember.count({
        where: {
          sessionId: params.sessionId,
          role: params.role
        }
      }).then(function(c) {
        params.colour = brandProjectConstants.memberColours.participants[c+1];
        createHelper(deferred, params);
      });
    }
  });


  return deferred.promise;
}

function createHelper(deferred, params) {
  SessionMember.create(params).then(function(sessionMember) {
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
      deferred.reject(MESSAGES.notFound + id);
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

  SessionMember.destroy({
    where: {
      sessionId: sessionId,
      role: role
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
