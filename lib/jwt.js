'use strict';

var models = require('./../models');
var q = require('q');
var jwt = require('jsonwebtoken');
var sessionServices = require('./../services/session');
var MessagesUtil = require('./../util/messages');
var JWTSecret = process.env.JWT_SECRET_KEY;
var algorithm = 'HS512';
var issuer = 'KlziiChat';

const DAYS = 3;
const MILISECONDS = 100;

function token(id, type) {
  let payload = {
    aud: type + id || `AccountUser:${id}`,
    sub: type + id || `AccountUser:${id}`,
    exp: expDate(),
    iss: issuer,
    typ: 'token'
  }

  return jwt.sign(payload, JWTSecret, { algorithm: algorithm });
}

function tokenForMember(userId, sessionId) {
  let deferred = q.defer();

  models.SessionMember.find({
    where: { sessionId: sessionId },
    include: [{
      model: models.AccountUser,
      where: {
        UserId: userId
      }
    }]
  }).then(function(result) {
    if(result) {
      deferred.resolve({ token: token(result.id, 'SessionMember:') });
    }
    else {
      deferred.reject(MessagesUtil.lib.jwt.notPart);
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function expDate() {
  return Math.ceil(new Date().setDate(new Date().getDate() + DAYS) / MILISECONDS);
}

module.exports = {
  token: token,
  tokenForMember: tokenForMember
}
