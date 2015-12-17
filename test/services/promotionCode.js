'use strict';

var assert = require('chai').assert;
var models  = require('./../../models');
var promotionCode  = require('./../../services/admin/promotionCode');

describe('SERVICE - PromotionCode', function() {

  var testPromotionCode = null;
  var startDate = new Date();
  var endDate = new Date(startDate.setDate(startDate.getDate() + 30));
  var validAttrs = {
    name: 'Test some promo.',
    startDate: startDate,
    endDate: endDate,
    discountType: 'value',
    discountValue: 100,
    minimalOrder: 100
  };

   beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      promotionCode.createPromoCode(validAttrs, function(error, result) {
        testPromotionCode = result;
        done();
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('returns list of all promotion codes', function (done) {
    promotionCode.findAllPromoCodes(function(error, results) {
      assert.equal(error, null);
      assert.equal(results[0].name, validAttrs.name);
      assert.deepEqual(results[0].startDate, validAttrs.startDate);
      assert.deepEqual(results[0].endDate, validAttrs.endDate);
      assert.equal(results[0].discountType, validAttrs.discountType);
      assert.equal(results[0].discountValue, validAttrs.discountValue);
      done();
    });
  });

  describe('#updatePromoCode', function() {
    it('Happy path', function (done) {
      let validEditAttrs = {
        id: testPromotionCode.id,
        name: "Updated some promo.",
        startDate: startDate,
        endDate: new Date(startDate.setDate(startDate.getDate() + 100)),
        discountType: "percentage",
        discountValue: 25
      };

      promotionCode.updatePromoCode(validEditAttrs, function(error, result) {
        assert.equal(error, null);
        assert.equal(result.name, validEditAttrs.name);
        assert.deepEqual(result.startDate, validEditAttrs.startDate);
        assert.deepEqual(result.endDate, validEditAttrs.endDate);
        assert.equal(result.discountType, validEditAttrs.discountType);
        assert.equal(result.discountValue, validEditAttrs.discountValue);
        done();
      });
    });

    it('Sad path', function (done) {
      let invalidEditAttrs = {
        id: testPromotionCode.id,
        name: null,
        startDate: startDate,
        endDate: Date(startDate.setDate(startDate.getDate() + 100)),
        discountType: 'percentage',
        discountValue: null
      }

      promotionCode.updatePromoCode(invalidEditAttrs, function(error, result) {
        let someErrors = { name: 'Name: cannot be null',
          discountValue: 'Discount Value: cannot be null'
        };

        assert.equal(result, null);
        assert.deepEqual(error, someErrors);
        done();
      });
    });

    it("can't find record to update", function (done) {
      let invalidId = testPromotionCode.id + 1;

      promotionCode.updatePromoCode({ id: invalidId }, function(error, result) {
        assert.equal(result, null);
        assert.equal(error, 'There is no promotion code with id: ' + invalidId);
        done();
      });
    });
  });

  describe('#createPromoCode', function() {
    it('Happy path', function (done) {
      let validCreateAttrs = {
        name: 'Test some create of promo.',
        startDate: startDate,
        endDate: endDate,
        discountType: 'value',
        discountValue: 100,
        minimalOrder: 100
      }

      promotionCode.createPromoCode(validCreateAttrs, function(error, result) {
        assert.equal(error, null);
        assert.equal(result.name, validCreateAttrs.name);
        assert.deepEqual(result.startDate, validCreateAttrs.startDate);
        assert.deepEqual(result.endDate, validCreateAttrs.endDate);
        assert.equal(result.discountType, validCreateAttrs.discountType);
        assert.equal(result.discountValue, validCreateAttrs.discountValue);
        done();
      });
    });

    it('Sad path', function (done) {
      let invalidCreateAttrs = {
        name: 'Test some create of promo.',
        startDate: startDate,
        endDate: endDate,
        discountType: 'gurkis',
        discountValue: null
      }

      promotionCode.createPromoCode(invalidCreateAttrs, function(error, result) {
        assert.equal(result, null);
        assert.deepEqual(error, { discountValue: 'Discount Value: cannot be null' });
        done();
      });
    });
  });

  describe('#removePromoCode', function() {
    it('Happy path', function (done) {
      promotionCode.removePromoCode(testPromotionCode.id, function(error) {
        assert.equal(error, null);
        done();
      });
    });

    it('Sad path', function (done) {
      let invalidId = testPromotionCode.id +1;

      promotionCode.removePromoCode(invalidId, function(error, result) {
        assert.equal(result, null);
        assert.equal(error, 'There is no promotion code with id: ' + invalidId);
        done();
      });
    });
  });
});
