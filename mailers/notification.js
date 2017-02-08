'use strict';

var helpers = require('./helpers');
var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');
var mailFrom = helpers.mailFrom();
var { sendMail } = require('./adapter');

function sendNotification(params, callback) {
  params.logInUrl = helpers.getUrl('', null, '');
  params.privacyPolicyUrl = helpers.getUrl('', null, '/privacy_policy');
  mailTemplateService.getActiveMailTemplate("emailNotification", null, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
      helpers.renderMailTemplate('emailNotification', params, function(error, html) {
        if (error) {
          return callback(error);
        }
        //mailTemplate.sendMailWithTemplate(html, params, callback);
        sendMail({
          from: mailFrom,
          to: params.email,
          subject: process.env.MAIL_FROM_NAME + ' - Message Notification ' + params.sessionName,
          html: html,
          attachments: [{
            filename: 'Klzii.png',
            path: 'public/images/mail/Klzii.png',
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
      let mailContent = mailTemplateService.composeMailFromTemplate(result, params);
      if (mailContent.error) {
        return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
};

module.exports = {
  sendNotification: sendNotification
};