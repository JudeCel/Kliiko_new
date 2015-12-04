'use strict';

var Invite = require('./../models').Invite;
var AccountUser = require('./../models').AccountUser;
var uuid = require('node-uuid');

function createInvite(accountUser, role, callback) {
  let token = uuid.v1();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 5);

  Invite.create({
    accountUserId: accountUser.id,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: role
  }).then(function (result) {
    Invite.find({ include: [ AccountUser ], where: { token: token } }).done(function(result) {
      callback(null, result);
    });
  }).catch(function (error) {
    callback(error);
  });
}

module.exports = {
  createInvite: createInvite
}
