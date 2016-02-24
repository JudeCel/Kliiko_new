'use strict';

var config = require('config');
var helpers = require('./helpers');

var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteAccountManager(inviteParams, callback) {
  let accountId = null;
  mailTemplateService.getActiveMailTemplate(mailTemplateService.mailTemplateType.accountManagerConfirmation, inviteParams.accountId, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
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
    } else {
      // found template in db
      var params = {
        logInUrl: helpers.getUrl(inviteParams.token, '/invite/'),
        firstName: inviteParams.firstName,
        lastName: inviteParams.lastName,
        accountName: inviteParams.accountName
      };

      var mailContent = mailTemplateService.composeMailFromTemplate(result, params);
      if (mailContent.error) {
          return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, inviteParams, callback);
    }
  });

};

module.exports = {
  sendInviteAccountManager: sendInviteAccountManager
};
