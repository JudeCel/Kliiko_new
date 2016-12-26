'use strict';

var helpers = require('./helpers');
var terms_of_service = require('../lib/terms_of_service');
var mailTemplate = require('./mailTemplate');
var mailHelper = require('./mailHelper');
var mailTemplateService = require('../services/mailTemplate');

var mailFrom = helpers.mailFrom();
var { sendMail } = require('./adapter');

function sendInviteAccountManager(inviteParams, callback) {
  let accountId = null;
  mailTemplateService.getActiveMailTemplate("accountManagerConfirmation", inviteParams, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
      let links = {
        url: helpers.getUrl(inviteParams.token, null, '/invite/'),
        firstName: inviteParams.firstName,
        lastName: inviteParams.lastName,
        accountName: inviteParams.accountName,
        termsOfUseUrl: terms_of_service.filter(inviteParams),
        privacyPolicyUrl: helpers.getUrl('', null, '/privacy_policy'),
      };

      helpers.renderMailTemplate('invite/inviteAccountUser', links, function(error, html){
        if(error) {
          return callback(error);
        }

        sendMail({
          from: mailFrom,
          to: inviteParams.email,
          subject: process.env.MAIL_FROM_NAME + ' - Join account',
          html: html,
          attachments: [{
            filename: 'header.png',
            path: 'public/images/mail/system_header.png',
            cid: 'systemHeader@attachment'
          }]
        }).then((resp) => {
          callback(null, resp);
        }, (error) => {
          callback(error);
        })
      });
    } else {
      // found template in db
      var params = {
        logInUrl: helpers.getUrl(inviteParams.token, null, '/invite/'),
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
  inviteParams.termsOfUseUrl = terms_of_service.filter(inviteParams)
  inviteParams.privacyPolicyUrl = helpers.getUrl('', null, '/privacy_policy');

  if(inviteParams.role == 'observer') {
    inviteParams.logInUrl = helpers.getUrl(inviteParams.token, null, '/invite/') + '/accept/';

    mailHelper.sendObserverInvitation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
  else if(inviteParams.role == 'participant') {
    inviteParams.acceptInvitationUrl = helpers.getUrl(inviteParams.token, null, '/invite/') + '/session/';
    inviteParams.invitationNotThisTimeUrl = helpers.getUrl(inviteParams.token, null, '/invite/') + '/notThisTime/';
    inviteParams.invitationNotAtAllUrl = helpers.getUrl(inviteParams.token, null, '/invite/') + '/notAtAll/';

    mailHelper.sendFirstInvitation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
  else if(inviteParams.role == 'facilitator'){
    inviteParams.logInUrl = helpers.getUrl(inviteParams.token, null, '/invite/') + '/accept/';

    mailHelper.sendFacilitatorEmailConfirmation(inviteParams, function(error, result) {
      callback(error, result);
    });
  }
};

module.exports = {
  sendInviteAccountManager: sendInviteAccountManager,
  sendInviteSession: sendInviteSession
};
