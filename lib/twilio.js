'use strict';
var q = require('q');
var _ = require('lodash');
var async = require('async');
var twilio = require('twilio');
var MessagesUtil = require('./../util/messages');
var client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = {
  messages: MessagesUtil.lib.twilio,
  sendSms: sendSms
}

function sendSms(numbers, message, provider) {
  let deferred = q.defer();

  if(!provider) {
    provider = client.messages.create;
  }
  async.each(numbers, function(number, callback) {
    createSms(prepareSmsParams(number, message), provider).then(function() {
      callback();
    }, function(error) {
      callback(error);
    });
  }, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(MessagesUtil.lib.twilio.allSmsSent);
    }
  });

  return deferred.promise;
};

function createSms(params, provider) {
  let deferred = q.defer();
  provider(params, function(error, _message) {
    if(error) {
      deferred.reject(error.message);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function prepareSmsParams(numbertTo, message) {
  return {
    body: message,
    to: numbertTo,
    from: process.env.TWILIO_SENDER_NUMBER
  };
}
