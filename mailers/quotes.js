'use strict';

var helpers = require('./helpers');
var q = require('q');
var mailFrom = helpers.mailFrom();
var { sendMail } = require('./adapter');

function sendQuote(params) {
  let deferred = q.defer();

  helpers.renderMailTemplate('quotes', params, function(err, html) {
    if(err) {
      deferred.reject(err);
    }else{
      sendMail({
        from: params.email,
        to: process.env.GET_A_QUOTE_EMAIL,
        subject: subject(params.firstName, params.lastName),
        html: html
      }).then((resp) => {
          deferred.resolve();
        }, (error) => {
          deferred.reject(error);
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
