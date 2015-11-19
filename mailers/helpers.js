"use strict";

var ejs = require('ejs');
var fs = require('fs');
var config = require('config');
var nodemailer = require('nodemailer');

var helpers = exports;

helpers.mailFrom = function(){
  return config.get('mail')['fromName']+" <"+config.get('mail')['fromEmail']+">";
};

helpers.getResetPaswordUrl = function(token){
  return "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/resetpassword/"+token;
};
helpers.getEmailConfirmationUrl = function(token){

  return "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/emailConfirmation/"+token;
};
helpers.renderMailTemplate = function(filename, params, callback){
  let tplfile = __dirname + '/templates/' + filename + '.ejs';

  fs.readFile(tplfile, 'utf8', function (err, tpl) {
    if (err) {
      return callback(err);
    }

    callback(null, ejs.render(tpl, params));
  });
};

helpers.createTransport = function(token){
  return nodemailer.createTransport(config.get('mail')['transport']);
};


