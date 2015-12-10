"use strict";
// var getResources = require('if-data').repositories.getResources;

var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Resource = models.Resource;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    resource_type: joi.string().required(),
    topicId: joi.number().required(),
    userId: joi.number().required()
  });
  if (err.error)
    return resCb(webFaultHelper.getValidationFault(err.error));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  Resource.findAll({where: req.params}).then(function(result) {
    resCb.send(result)
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
