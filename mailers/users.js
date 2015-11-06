var nodemailer = require('nodemailer');
var config = require('config');
var helpers = require('./helpers');
var users = exports;

var mailFrom = helpers.mailFrom();

users.sendResetPasswordToken = function(params, callback) {

    var link = { url: helpers.getResetPaswordUrl(params.token)};

    helpers.renderMailTemplate('resetPasswordToken', link, function(err, data){
      if (err) return callback(err);

      var transporter = nodemailer.createTransport(config.get('mail')['transport']);

      transporter.sendMail({
        from: mailFrom,
        to: params.email,
        subject: 'Insider Focus - Reset password',
        html: html
      }, callback);
    });
};

users.sendResetPasswordSuccess = function(params, callback) {

    helpers.renderMailTemplate('resetPasswordSuccess', {}, function(err, data){
      if (err) return callback(err);

      var transporter = nodemailer.createTransport(config.get('mail')['transport']);

      transporter.sendMail({
        from: mailFrom,
        to: params.email,
        subject: 'Insider Focus - Reset password Success',
        html: html
      }, callback);
    });
};

