'use strict';

var config = require('config');
var helpers = require('./helpers');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteAccountManager(inviteParams, callback) {
  let links = {
    url: helpers.getUrl(inviteParams.token, '/invite/'),
    firstName: inviteParams.firstName,
    lastName: inviteParams.lastName,
    accountName: inviteParams.accountName
  };

  helpers.renderMailTemplate('invite/inviteAccountUser', links, function(error, html){
    if(error) {
      return callback(error);
    }

    transporter.sendMail({
      from: mailFrom,
      to: inviteParams.email,
      subject: 'Insider Focus - Join account',
      html: html,
      attachments: [{
        filename: 'header.png',
        path: 'public/images/mail/system_header.png',
        cid: 'systemHeader@kliiko'
      }]
    }, callback);
  });
};

module.exports = {
  sendInviteAccountManager: sendInviteAccountManager
};
