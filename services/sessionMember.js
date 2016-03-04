'use strict';

var models = require('./../models');
var filters = require('./../models/filters');

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
  bulkCreate: bulkCreate,
  removeByIds: removeByIds,
  removeByRole: removeByRole,
  messages: MESSAGES
};

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

/**
 * bulkCreate
 * @param params {Array}
 * @param sessionId {number}
 * @returns {*|promise}
 */
function bulkCreate(params, sessionId) {
  let deferred = q.defer();

  SessionMember.bulkCreate(params).then(function(result) {
    SessionMember.findAll({
      where: { sessionId: sessionId }
    }).then(function(members) {
      if(_.isEmpty(members)) {
        deferred.reject(MESSAGES.wrongSessionId + sessionId);
      }
      else {
        deferred.resolve(members);
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

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
