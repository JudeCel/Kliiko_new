"use strict";
var assert = require('assert');
var models  = require('./../../models');
var promotionCode  = require('./../../services/admin/promotionCode');

describe('Promotion codes', function() {

  var testPromotionCode = null;
  var startDate = new Date();
  var endDate = new Date(startDate.setDate(startDate.getDate() + 30));
  var validAttrs = {
    name: "Test some promo.",
    startDate: startDate,
    endDate: endDate,
    discounType: "value",
    discountValue: 100
  };

   beforeEach(function(done) {

    models.sequelize.sync({ force: true }).then(() => {
      promotionCode.create(validAttrs, function(error, result) {
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

  // it('returns list of all promotion codes', function (done) {
  //   promotionCode.list(function(error, result) {
  //     assert.equal(error, null);
  //     assert.equal(result[0]['name'], validAttrs.name);
  //     assert.equal(result[0]['startDate'], validAttrs.startDate);
  //     assert.equal(result[0]['endDate'], validAttrs.endDate);
  //     assert.equal(result[0]['discounType'], validAttrs.discounType);
  //     assert.equal(result[0]['discountValue'], validAttrs.discountValue);
  //   });
  //   done();
  // });

  // describe('Edit', function() {
  //   it('Happy path', function (done) {
  //     let validEditAttrs = {
  //       id: testPromotionCode.id,
  //       name: "Updated some promo.",
  //       startDate: startDate,
  //       endDate: Date(startDate.setDate(startDate.getDate() + 100)),
  //       discounType: "percentage",
  //       discountValue: 25
  //     };

  //     promotionCode.edit(validEditAttrs, function(error, result) {
  //       assert.equal(error, null);
  //       assert.equal(result[0]['name'], validEditAttrs.name);
  //       assert.equal(result[0]['startDate'], validEditAttrs.startDate);
  //       assert.equal(result[0]['endDate'], validEditAttrs.endDate);
  //       assert.equal(result[0]['discounType'], validEditAttrs.discounType);
  //       assert.equal(result[0]['discountValue'], validEditAttrs.discountValue);
  //     });
  //     done();
  //   });


  //   it('Sad path', function (done) {
  //     let invalidEditAttrs = {
  //       id: testPromotionCode.id,
  //       name: null,
  //       startDate: startDate,
  //       endDate: Date(startDate.setDate(startDate.getDate() + 100)),
  //       discounType: "percentage",
  //       discountValue: null
  //     }

  //     promotionCode.edit(invalidEditAttrs, function(errors, result) {
  //       assert.equal(result, null);
  //       console.log(errors['name'], SequelizeValidationError);
  //       console.log(errors['discountValue'], SequelizeValidationError);
  //     });
  //     done();
  //   });

  //   it("can't find record to update", function (done) {
  //     let invalidId = testPromotionCode.id + 1;

  //     promotionCode.edit({id: invalidId}, function(errors, result) {
  //       assert.equal(result, null);
  //       assert.equal(errors, "There is no promotion code with id: 2");
  //     });
  //     done();
  //   });
  // });  

  describe('Create', function() {
    it('Happy path', function (done) {

      done();
    });

    it('Sad path', function (done) {

      done();
    });
  });  

  // describe('Delete', function() {
  //   it('Happy path', function (done) {

  //     done();
  //   });

  //   it('Sad path', function (done) {

  //     done();
  //   });
  // });  
});
