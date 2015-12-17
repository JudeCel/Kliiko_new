'use strict';
var PromotionCode  = require('./../../models').PromotionCode;
var crypto = require('crypto');

function findAllPromoCodes(callback) {
  PromotionCode.findAll({ order: 'name ASC' }).then(function(promoCodes) {
    callback(null, promoCodes);
  });
};

function createPromoCode(params, callback) {
  params.code = generateCode();

  PromotionCode.create(params).then(function(promoCode) {
    callback(null, promoCode);
  }).catch(PromotionCode.sequelize.ValidationError, function(error) {
    callback(error);
  }).catch(function(error) {
    callback(error);
  });
};

function editPromoCode(params, callback) {
  PromotionCode.find({ where: { id: params.id } }).then(function (result) {
    if(result) {
      result.update(params).then(function(updated) {
        callback(null, updated);
      }).catch(function(error) {
        callback(error);
      });
    }
    else {
      callback('There is no promotion code with id: ' + params.id);
    };
  });
};

function destroyPromoCode(id, callback) {
  PromotionCode.find({ where: { id: id } }).then(function(result) {
    if(result) {
      result.destroy().then(function(result) {
        callback(null, 'Promotion code deleted successfully.');
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


module.exports = {
  findAllPromoCodes: findAllPromoCodes,
  createPromoCode: createPromoCode,
  editPromoCode: editPromoCode,
  destroyPromoCode: destroyPromoCode
};
