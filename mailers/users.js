"use strict";

var config = require('config');
var helpers = require('./helpers');
var users = exports;
var mailTemplate = require('./mailTemplate');
var mailTemplateService = require('../services/mailTemplate');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

users.sendReactivateOrDeactivate = function(params, callback){
  let templateType = !params.active ? mailTemplateService.mailTemplateType.deactivatedAccount : mailTemplateService.mailTemplateType.reactivatedAccount;
  mailTemplateService.getActiveMailTemplate(templateType, null, function(error, result) {
    //if failed to find mail template from DB, use old version
    let fields = { name: params.name, active: params.active,  firstName: params.firstName, lastName: params.lastName, logInUrl: "http://"+config.get("server").domain}
    if (error) {
      helpers.renderMailTemplate('reactivateOrDeactivate', fields, function(err, html){
        if(err) {
          return callback(err);
        }

        let reactivatedorDeactivated = params.active ? 'Reactivated' : 'Deactivated';
        transporter.sendMail({
          from: mailFrom,
          to: params.email,
          subject: reactivatedorDeactivated,
          html: html
        }, callback);
      });
    } else {
      // found template in db
      fields.accountName = fields.name;
      var mailContent = mailTemplateService.composeMailFromTemplate(result, fields);
      //caller of users.sendReactivateOrDeactivate doesn't specify callback
      if (mailContent.error) {
        if (callback) {
          callback(mailContent.error);
        }
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
};

users.sendResetPasswordToken = function(params, callback) {
  let resetPasswordPath = '/resetpassword/';
  mailTemplateService.getActiveMailTemplate(mailTemplateService.mailTemplateType.passwordResetRequest, null, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
      let link = { url: helpers.getUrl(params.token, resetPasswordPath)};
      helpers.renderMailTemplate('resetPasswordToken', link, function(err, html){
        if (err) {
          return callback(err);
        }

        transporter.sendMail({
          from: mailFrom,
          to: params.email,
          subject: 'Insider Focus - Reset password',
          html: html
        }, callback);
      });
    } else {
      // found template in db
      var mailContent = mailTemplateService.composeMailFromTemplate(result, {
        resetPasswordUrl: helpers.getUrl(params.token, resetPasswordPath),
        firstName: params.name
      });
      if (mailContent.error) {
          return callback(mailContent.error);
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
};

users.sendEmailConfirmationToken = function(params, callback) {
  let emailConfirmationPath = '/emailConfirmation/';
  let link = { url: helpers.getUrl(params.token, emailConfirmationPath)};

  helpers.renderMailTemplate('confirmationEmail', link, function(err, html){
    if (err) {
      return callback(err);
    }

    transporter.sendMail({
      from: mailFrom,
      to: params.email,
      subject: 'Insider Focus - Confirmation Email',
      html: html
    }, callback);
  });
};

users.sendEmailConfirmationSuccess = function(params, callback) {

  helpers.renderMailTemplate('confirmationEmailSuccess', {}, function(err, html){
    if (err) {
      return callback(err);
    }

    transporter.sendMail({
      from: mailFrom,
      to: params.email,
      subject: 'Insider Focus - Email Confirmation Success',
      html: html
    }, callback);
  });
};

users.sendPasswordChangedSuccess = function(params, callback) {
  mailTemplateService.getActiveMailTemplate(mailTemplateService.mailTemplateType.passwordChangeSuccess, null, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
      helpers.renderMailTemplate('changePasswordSuccess', {}, function(err, html){
        if (err) {
          return callback(err);
        }

        transporter.sendMail({
          from: mailFrom,
          to: params.email,
          subject: 'Insider Focus - Change password Success',
          html: html
        }, callback);
      });
    } else {
      // found template in db
      let fields = { firstName: params.name };
      var mailContent = mailTemplateService.composeMailFromTemplate(result, fields);
      //caller of users.sendReactivateOrDeactivate doesn't specify callback
      if (mailContent.error) {
        if (callback) {
          callback(mailContent.error);
        }
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
};

users.sendResetPasswordSuccess = function(params, callback) {
  mailTemplateService.getActiveMailTemplate(mailTemplateService.mailTemplateType.passwordChangeSuccess, null, function(error, result) {
    //if failed to find mail template from DB, use old version
    if (error) {
      helpers.renderMailTemplate('resetPasswordSuccess', {}, function(err, html){
        if (err) {
          return callback(err);
        }

        transporter.sendMail({
          from: mailFrom,
          to: params.email,
          subject: 'Insider Focus - Change password Success',
          html: html
        }, callback);
      });
    } else {
      // found template in db
      let fields = { firstName: params.name };
      var mailContent = mailTemplateService.composeMailFromTemplate(result, fields);
      //caller of users.sendReactivateOrDeactivate doesn't specify callback
      if (mailContent.error) {
        if (callback) {
          callback(mailContent.error);
        }
      }
      mailTemplate.sendMailWithTemplate(mailContent, params, callback);
    }
  });
};
