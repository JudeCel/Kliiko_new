'use strict';

var Invite = require('./../models').Invite;
var uuid = require('node-uuid');

function createInvite(params, callback) {
  let token = uuid.v1();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 5);

  Invite.create({
    userId: params.id,
    accountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate
  }).then(function (result) {
    console.log(result);
    // if(result[0] > 0) {
    //   callback(null, token);
    // } else {
    //   callback(null, null);
    // }
  })
  .catch(function (error) {
    callback(error);
  });

}
