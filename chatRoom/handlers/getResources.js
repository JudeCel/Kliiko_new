"use strict";
var getResources = require('if-data').repositories.getResources;

var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    resource_type: joi.number().required(),
    topicId: joi.number().required(),
    userId: joi.number().required()
  });
  if (err.error)
    return resCb(webFaultHelper.getValidationFault(err.error));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  getResources(req.params)
  .done(function (data) {
    resCb.send(data);
  }, function (err) {
    errCb(webFaultHelper.getFault(err));
  });
};
