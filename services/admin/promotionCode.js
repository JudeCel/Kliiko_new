'use strict';

var PromotionCode  = require('./../../models').PromotionCode;
var crypto = require('crypto');
var _ = require('lodash');

var validAttributes = [
  'name',
  'startDate',
  'endDate',
  'discountType',
  'discountValue',
  'minimalOrder'
];

function findAllPromoCodes(callback) {
  PromotionCode.findAll({
    order: 'name ASC',
    attributes: validAttributesForView()
  }).then(function(promoCodes) {
    callback(null, promoCodes);
  }).catch(function(error) {
    callback(error);
  });
};

function createPromoCode(params, callback) {
  let validatedParams = validateParams(params);
  validatedParams.code = generateCode();

  PromotionCode.create(validatedParams).then(function(result) {
    callback(null, validateParams(result, validAttributesForView()));
  }).catch(PromotionCode.sequelize.ValidationError, function(error) {
    callback(prepareErrors(error));
  }).catch(function(error) {
    callback(error);
  });
};

function updatePromoCode(params, callback) {
  PromotionCode.update(validateParams(params), { where: { id: params.id }, returning: true }).then(function(result) {
    if(result[0] == 0) {
      callback('There is no promotion code with id: ' + params.id);
    }
    else {
      callback(null, validateParams(result[1][0], validAttributesForView()));
    }
  }).catch(PromotionCode.sequelize.ValidationError, function(error) {
    callback(prepareErrors(error));
  }).catch(function(error) {
    callback(error);
  });
};

function removePromoCode(id, callback) {
  PromotionCode.destroy({ where: { id: id } }).then(function(result) {
    if(result == 0) {
      callback('There is no promotion code with id: ' + id);
    }
    else {
      callback(null);
    }
  }).catch(PromotionCode.sequelize.ValidationError, function(error) {
    callback(prepareErrors(error));
  }).catch(function(error) {
    callback(error);
  });
};

function generateCode() {
  return crypto.randomBytes(10).toString('hex');
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ":" + n.message.replace(n.path, '');
  });
  return errors;
};

function validAttributesForView() {
  let array = validAttributes.slice();
  array.push('id');
  array.push('code');
  return array;
};

function validateParams(params, attrs) {
  return _.pick(params, attrs || validAttributes);
};


module.exports = {
  findAllPromoCodes: findAllPromoCodes,
  createPromoCode: createPromoCode,
  updatePromoCode: updatePromoCode,
  removePromoCode: removePromoCode
};
