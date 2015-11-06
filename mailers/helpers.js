var config = require('config');
var ejs = require('ejs');
var fs = require('fs')
var helpers = exports;

helpers.mailFrom = function(){
  return config.get('mail')['fromName']+" <"+config.get('mail')['fromEmail']+">";
};

helpers.getResetPaswordUrl = function(token){
  return "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/resetpassword/"+token;
};

helpers.renderMailTemplate = function(filename, params, callback){
  var tplfile = __dirname + '/templates/' + filename + '.ejs';

  fs.readFile(tplfile, 'utf8', function (err, tpl) {
    if (err) return callback(err);
    callback(null, ejs.render(tpl, params));
  });
}

