'use strict';

var config = require('config');
var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendMailWithTemplate(id, inviteParams, callback) {
  let links = {
    url: helpers.getUrl(inviteParams.token, '/invite/'),
    firstName: inviteParams.firstName,
    lastName: inviteParams.lastName,
    accountName: inviteParams.accountName
  };
  

  mailTemplateService.getMailTemplate(id, function(error, result) {
    if (error) {
        return callback(error);
    }  
    
    var mailContent =mailTemplateService.composeMailFromTemplate(result);
    if (mailContent.error) {
        return callback(mailContent.error);
    }
    
    transporter.sendMail({
      from: mailFrom,
      to: inviteParams.email,
      subject: result.subject,
      html: result.content
    }, callback);  
  });
}

module.exports = {
  sendMailWithTemplate: sendMailWithTemplate
};
