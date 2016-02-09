'use strict';

var q = require('q');
var models = require('./../../models');
var AccountUser = models.AccountUser;
var SessionMember = models.SessionMember;

const VALID_ATTRIBUTES = {
  accountUser: [
    'id',
    'role'
  ],
  sessionMember: [
    'id',
    'role',
    'sessionId'
  ]
};

function get(req, res, next) {
  AccountUser.find({
    where: {
      AccountId: res.locals.currentDomain.id,
      UserId: req.user.id
    },
    attributes: VALID_ATTRIBUTES.accountUser
  }).then(function(accountUser) {
    if(accountUser) {
      joinSessionMembers(accountUser.dataValues).then(function() {
        res.send(accountUser);
      }, function(error) {
        res.send({ error: error });
      });
    }
    else {
      res.send({ error: 'AccountUser not found' });
    }
  }).catch(function(error) {
    res.send({ error: error });
  });
};

function joinSessionMembers(accountUser) {
  let deferred = q.defer();

  SessionMember.findAll({
    where: {
      accountUserId: accountUser.id
    },
    attributes: VALID_ATTRIBUTES.sessionMember
  }).then(function(results) {
    accountUser.SessionMembers = results;
    deferred.resolve();
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

module.exports = {
  get: get
};
