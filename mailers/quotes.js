'use strict';

var helpers = require('./helpers');
var q = require('q');
var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();


function sendQuote(params) {
  let deferred = q.defer();

  helpers.renderMailTemplate('quotes', params, function(err, html) {
    if(err) {
      deferred.reject(err);
    }else{
      transporter.sendMail({
        from: params.email,
        to: process.env.GET_A_QUOTE_EMAIL,
        subject: subject(params.firstName, params.lastName),
        html: html
      }, function(error, info){
        if(error){
          deferred.reject(error);
        }else{
          deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

function subject(firstName, lastName) {
  return "New Quote from user: " + firstName + " " + lastName;
}

module.exports = {
  sendQuote: sendQuote
};
