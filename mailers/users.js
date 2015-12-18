"use strict";

var config = require('config');
var helpers = require('./helpers');
var users = exports;

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

users.sendReactivateOrDeactivate = function(params, callback){
  let account = { name: params.name, active: params.active }
  helpers.renderMailTemplate('reactivateOrDeactivate', account, function(err, html){
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
};

users.sendResetPasswordToken = function(params, callback) {
  let resetPasswordPath = '/resetpassword/';
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
};
users.sendResetPasswordSuccess = function(params, callback) {
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
};
