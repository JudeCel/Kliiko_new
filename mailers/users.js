var nodemailer = require('nodemailer');
var config = require('config');

var users = exports;

users.sendResetPasswordToken = function(params, callback) {

  var transporter = nodemailer.createTransport(config.get('mail'));

  var message = "A request was made to change your password for.  Click link to reset: ";
      message += "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/resetpassword/"+params.token;

    transporter.sendMail({
        from: 'Insider Focus <insiderfocus.noreply@gmail.com>',
        to: params.email,
        subject: 'Insider Focus - Reset password',
        html: message
    }, callback);

};

users.sendResetPasswordSuccess = function(params, callback) {

  var transporter = nodemailer.createTransport(config.get('mail'));
  var message = " Your password reset successfully";

    transporter.sendMail({
        from: 'Insider Focus <insiderfocus.noreply@gmail.com>',
        to: params.email,
        subject: 'Insider Focus - Reset password Success',
        html: message
    }, callback);

};

