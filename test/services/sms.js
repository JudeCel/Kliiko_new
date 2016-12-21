'use strict';
// var models = require('./../../models');
// var Account = models.Account;
// var AccountUser = models.AccountUser;

var assert = require('chai').assert;
var smsService = require('./../../services/sms');

describe('SERVICE - SMS', () => {
  describe('#calculateSmsCountParams', () => {
    it("when can take from planSmsCount", (done) => {
      let data = { paidSmsCount: 0, planSmsCount: 20 }
      let result = smsService.calculateSmsCountParams(data, 10);

      try {
        assert.deepEqual(result, { 'data.planSmsCount': 10 });
        done();
      } catch (e) {
        done(e);
      }
    });

    it("when need take from paidSmsCount and planSmsCount", (done) => {
      let data = { paidSmsCount: 10, planSmsCount: 20 }
      let result = smsService.calculateSmsCountParams(data, 25);

      try {
        assert.deepEqual(result, { 'data.planSmsCount': 0, 'data.paidSmsCount': 5 });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
  describe('#validate', () => {
    it("when valid count", (done) => {
      let data = { paidSmsCount: 0, planSmsCount: 20 }
      smsService.validate(10, data).then(() => {
        done();
      }, (error) => {
        done(error);
      });
    });

    it("when invalide", (done) => {
      let data = { paidSmsCount: 5, planSmsCount: 10 }
      smsService.validate(20, data).then(() => {
        done("Should not get here!!!");
      }, (error) => {
        try {
          assert.equal(error, smsService.buildErrorMessage(20, 15))
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
