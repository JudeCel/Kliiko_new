'use strict';

var PromotionCode  = require('./../../models').PromotionCode;
var crypto = require('crypto');
var _ = require('lodash');

function findAllPromoCodes(callback) {
  PromotionCode.findAll({ order: 'name ASC' }).then(function(promoCodes) {
    callback(null, promoCodes);
  });
};

function createPromoCode(params, callback) {
  params.code = generateCode();

  PromotionCode.create(params).then(function(result) {
    callback(null, result);
  }).catch(PromotionCode.sequelize.ValidationError, function(error) {
    callback(prepareErrors(error));
  }).catch(function(error) {
    callback(error);
  });
};

function updatePromoCode(id, params, callback) {
  PromotionCode.find({ where: { id: id } }).then(function (result) {
    if(result) {
      result.update(params).then(function(updated) {
        callback(null, updated);
      }).catch(PromotionCode.sequelize.ValidationError, function(error) {
        callback(prepareErrors(error));
      }).catch(function(error) {
        callback(error);
      });
    }
    else {
      callback('There is no promotion code with id: ' + params.id);
    };
  });
};

function removePromoCode(id, callback) {
  PromotionCode.find({ where: { id: id } }).then(function(result) {
    if(result) {
      result.destroy().then(function(result) {
        callback(null);
      }).catch(function(error) {
        callback(error);
      });
    }
    else {
      callback('There is no promotion code with id: ' + id);
    };
  });
};

function generateCode() {
  return crypto.randomBytes(10).toString('hex');
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ": " + n.message.replace(n.path, '');
  });
  return errors;
};


module.exports = {
  findAllPromoCodes: findAllPromoCodes,
  createPromoCode: createPromoCode,
  updatePromoCode: updatePromoCode,
  removePromoCode: removePromoCode
};
