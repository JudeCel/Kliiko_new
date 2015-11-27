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
      return config.get('mail')['transport'];
  }
}

helpers.mailFrom = function(){
  return config.get('mail')['fromName']+" <"+config.get('mail')['fromEmail']+">";
};

helpers.getUrl = function(token, path){
  return "http://"+config.get('server')['domain']+":"+config.get('server')['port']+path+token;
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
