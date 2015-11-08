var config = require('config');
var helpers = require('./helpers');
var users = exports;

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

users.sendResetPasswordToken = function(params, callback) {

    var link = { url: helpers.getResetPaswordUrl(params.token)};

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

users.sendResetPasswordSuccess = function(params, callback) {

    helpers.renderMailTemplate('resetPasswordSuccess', {}, function(err, html){
      if (err) {
        return callback(err);
      }

      transporter.sendMail({
        from: mailFrom,
        to: params.email,
        subject: 'Insider Focus - Reset password Success',
        html: html
      }, callback);
    });
};

