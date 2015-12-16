'use strict';

var config = require('config');
var helpers = require('./helpers');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteAccountManager(inviteParams, callback) {
  let links = {
    url: helpers.getUrl(inviteParams.token, '/invite/')
  };

  helpers.renderMailTemplate('invite/inviteAccountUser', links, function(error, html){
    if(error) {
      return callback(error);
    }

    transporter.sendMail({
      from: mailFrom,
      to: inviteParams.email,
      subject: 'Insider Focus - Join account',
      html: html
    }, callback);
  });
};

module.exports = {
  sendInviteAccountManager: sendInviteAccountManager
};
