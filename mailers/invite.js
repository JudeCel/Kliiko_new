'use strict';

var config = require('config');
var helpers = require('./helpers');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteNewUserToAccount(params, callback) {
  let inviteNewUserToAccount = '/resetpassword/';
  let link = { url: helpers.getUrl(params.token, inviteNewUserToAccount) };

  helpers.renderMailTemplate('inviteNewUserToAccount', link, function(err, html){
    if (err) {
      return callback(err);
    }

    transporter.sendMail({
      from: mailFrom,
      to: params.email,
      subject: 'Insider Focus - Join account',
      html: html
    }, callback);
  });
};

module.exports = {
  sendInviteNewUserToAccount: sendInviteNewUserToAccount
};
