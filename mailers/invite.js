'use strict';

var config = require('config');
var helpers = require('./helpers');

var inviteService = require('../services/invite');
var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteNewUserToAccount(params, callback) {
  inviteService.createInvite(params, function(error, invite) {
    if(error) {
      callback(error);
    }
    else {
      let links = {
        accept: helpers.getUrl(invite.token, '/invite/accept/'),
        decline: helpers.getUrl(invite.token, '/invite/decline/')
      };

      helpers.renderMailTemplate('invite/inviteNewUserToAccount', links, function(error, html){
        if(error) {
          return callback(error);
        }

        transporter.sendMail({
          from: mailFrom,
          to: invite.User.email,
          subject: 'Insider Focus - Join account',
          html: html
        }, callback);
      });
    }
  });
};

module.exports = {
  sendInviteNewUserToAccount: sendInviteNewUserToAccount
};
