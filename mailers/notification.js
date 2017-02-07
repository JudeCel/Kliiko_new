'use strict';

var helpers = require('./helpers');
var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');

function sendNotification(params, callback) {
  mailTemplateService.getActiveMailTemplate("emailNotification", null, function(error, result) {
    if (error) {
      return callback(error);
    }
    params.logInUrl = helpers.getUrl('', null, '');
    let mailContent = mailTemplateService.composeMailFromTemplate(result, params);
    if (mailContent.error) {
      return callback(mailContent.error);
    }
    mailTemplate.sendMailWithTemplate(mailContent, params, callback);
  });
};

module.exports = {
  sendNotification: sendNotification
};