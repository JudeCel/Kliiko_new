"use strict";

var ejs = require('ejs');
var fs = require('fs');
var config = require('config');
var nodemailer = require('nodemailer');
var stubTransport = {
    name: 'testsend',
    version: '1',
    send: function(data, callback) { callback(null, data) }
};
var helpers = exports;

function envConfig() {
  switch (process.env.NODE_ENV) {
    case "test":
      return stubTransport;
      break;
    default:
      return process.env.MAIL_TRANSPORT_SERVICE;
  }
}

helpers.mailFrom = function(){
  return process.env.MAIL_FROM_NAME + " <" + process.env.MAIL_FROM_NAME + ">";
};

helpers.getUrl = function(token, path){
  return "http://" + process.env.SERVER_DOMAIN + ":" + process.env.SERVER_PORT + path + token;
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
  return nodemailer.createTransport(envConfig());
};
