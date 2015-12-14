"use strict";
var assert = require('assert');
var models  = require('./../../models');
var promotionCode  = models.promotionCode;
var usersServices  = require('./../../services/promotionCode');

describe('Promotion codes', function() {
   beforeEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('returns list of all promotion codes', function (done) {
    promotionCode.list
    done();
  });

  it('Edit promotion code', function (done) {

    done();
  });

  it('Delete promotion code', function (done) {

    done();
  });
});
