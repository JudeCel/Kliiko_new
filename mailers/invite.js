'use strict';

var helpers = require('./helpers');

var mailTemplate = require('./mailTemplate');
var mailHelper = require('./mailHelper');
var mailTemplateService = require('../services/mailTemplate');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendInviteAccountManager(inviteParams, callback) {
  let accountId = null;
  mailTemplateService.getActiveMailTemplate("accountManagerConfirmation", inviteParams, function(error, result) {
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
          subject: process.env.MAIL_FROM_NAME + ' - Join account',
          html: html,
          attachments: [{
            filename: 'header.png',
            path: 'public/images/mail/system_header.png',
            cid: 'systemHeader@attachment'
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

function sendInviteSession(inviteParams, callback) {
  if(inviteParams.role == 'observer') {
    inviteParams.logInUrl = helpers.getUrl(inviteParams.token, '/invite/') + '/accept/';

    mailHelper.sendObserverInvitation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
  else if(inviteParams.role == 'participant') {
    inviteParams.acceptInvitationUrl = helpers.getUrl(inviteParams.token, '/invite/') + '/accept/';
    inviteParams.invitationNotThisTimeUrl = helpers.getUrl(inviteParams.token, '/invite/') + '/notThisTime/';
    inviteParams.invitationNotAtAllUrl = helpers.getUrl(inviteParams.token, '/invite/') + '/notAtAll/';

    mailHelper.sendFirstInvitation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
  else if(inviteParams.role == 'facilitator'){
    inviteParams.logInUrl = helpers.getUrl(inviteParams.token, '/invite/');

    mailHelper.sendFacilitatorEmailConfirmation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
};

module.exports = {
  sendInviteAccountManager: sendInviteAccountManager,
  sendInviteSession: sendInviteSession
};
