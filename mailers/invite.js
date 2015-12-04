'use strict';

var config = require('config');
var helpers = require('./helpers');

var inviteService = require('../services/invite');
var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteNewUserToAccount(accountUser, role, callback) {
  inviteService.createInvite(accountUser, role, function(error, invite) {
    if(error) {
      callback(error);
    }
    else {
      let inviteNewUserToAccount = '/invite/accept/';
      let link = { url: helpers.getUrl(invite.token, inviteNewUserToAccount) };

      helpers.renderMailTemplate('invite/inviteNewUserToAccount', link, function(error, html){
        if(error) {
          return callback(error);
        }

        invite.AccountUser.getUser().done(function(result) {
          transporter.sendMail({
            from: mailFrom,
            to: result.email,
            subject: 'Insider Focus - Join account',
            html: html
          }, callback);
        });
      });
    }
  });
};

module.exports = {
  sendInviteNewUserToAccount: sendInviteNewUserToAccount
};
