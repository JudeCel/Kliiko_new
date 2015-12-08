'use strict';

var models = require('./../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var uuid = require('node-uuid');

function createInvite(params, callback) {
  let token = uuid.v1();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 5);

  Invite.create({
    userId: params.userId,
    accountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role
  }).then(function(result) {
    Invite.find({ include: [ User, Account ], where: { token: token } }).done(function(result) {
      callback(null, result);
    });
  }).catch(function(error) {
    callback(error);
  });
}

function findInvite(token, callback) {
  Invite.find({ include: [ User, Account ], where: { token: token } }).then(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback('Not found');
    }
  }).catch(function(error) {
    callback(error);
  });
}

module.exports = {
  createInvite: createInvite,
  findInvite: findInvite
}
