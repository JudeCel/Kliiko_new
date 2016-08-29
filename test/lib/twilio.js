'use strict';

var twilioRepo = require('./../../lib/twilio');
var assert = require('chai').assert;
var _ = require('lodash');

describe.only('LIB - Twilio', function() {
  describe('#sendSms', function() {
    let multipleMobiles = function(count, mobile) {
      let array = new Array(count);
      array.fill(mobile || process.env.TWILIO_SENDER_NUMBER);
      return array;
    };

    describe('happy path', function() {
      let provider = function(params, callback) {
        callback();
      };

      it('should succeed on sending 1 sms', function (done) {
        twilioRepo.sendSms(multipleMobiles(1), 'Test message', provider).then(function(message) {
          assert.equal(message, twilioRepo.messages.allSmsSent);
          done();
        }, function(error) {
          done(error);
        });
      });

      it('should succeed on sending all sms', function (done) {
        twilioRepo.sendSms(multipleMobiles(3), 'Test message', provider).then(function(message) {
          assert.equal(message, twilioRepo.messages.allSmsSent);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      function errorProvider(error) {
        return function(params, callback) {
          callback({ message: error });
        };
      }

      it('should fail because not valid phone number', function (done) {
        let errorMessage = "The 'To' number nonNumberMobile is not a valid phone number.";
        let provider = errorProvider(errorMessage);

        twilioRepo.sendSms(multipleMobiles(1, 'nonNumberMobile'), 'Test message', provider).then(function(message) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, errorMessage);
          done();
        });
      });
    });
  });
});
