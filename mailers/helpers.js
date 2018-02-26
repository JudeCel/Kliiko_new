"use strict";

var ejs = require('ejs');
var fs = require('fs');
var urlHeplers = require('./../services/urlHeplers');

var helpers = exports;

helpers.mailFrom = function(){
  return process.env.MAIL_FROM_NAME + " <" + process.env.MAIL_FROM_EMAIL + ">";
};

helpers.getUrl = function(token, accountUserId, path){
  let url = urlHeplers.getBaseUrl() + path + token;
  if (accountUserId) {
    url += '/' + encodeURI(new Buffer(accountUserId.toString()).toString('base64'))
  }
  return url;
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
