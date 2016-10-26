"use strict";

var ejs = require('ejs');
var fs = require('fs');
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
      let confObject = {
        host: process.env.MAIL_TRANSPORT_SERVICE,
        auth: {
          user: process.env.MAIL_TRANSPORT_AUTH_USER,
          pass: process.env.MAIL_TRANSPORT_AUTH_PASS
        },
        debug: true,
        logger: true,
        secureConnection: process.env.MAIL_TRANSPORT_SECURE_CONNECTION == "true",
        port: parseInt(process.env.MAIL_TRANSPORT_PORT)
      };
      console.log(confObject);
      return confObject;
  }
}

helpers.mailFrom = function(){
  return process.env.MAIL_FROM_NAME + " <" + process.env.MAIL_FROM_EMAIL + ">";
};

helpers.getUrl = function(token, path){
  return "http://" + process.env.SERVER_DOMAIN + returnPort() + path + token;
};

function returnPort() {
  if(process.env.NODE_ENV == "production"){
    return '';
  }else{
    return ":" + process.env.SERVER_PORT;
  }
}

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
