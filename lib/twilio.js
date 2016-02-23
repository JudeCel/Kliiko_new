'use strict';

var q = require('q');
var _ = require('lodash');
var async = require('async');
var config = require('config');
var twilio = require('twilio');
var client = twilio(config.get('twilioAccountSid'), config.get('twilioAuthToken'));

const MESSAGES = {
  allSmsSent: 'All messages have been sent'
};

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
      deferred.resolve(MESSAGES.allSmsSent);
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
    from: config.get('twilioSenderNumber')
  };
}

module.exports = {
  messages: MESSAGES,
  sendSms: sendSms
}
