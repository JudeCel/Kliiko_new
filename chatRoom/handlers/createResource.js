"use strict";
var _ = require("lodash");
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Resource = models.Resource;


module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    resourceType: joi.string().required(),
    url: joi.string().optional(),
    topicId: joi.number().optional(),
    userId: joi.number().optional(),
    JSON: joi.string().optional()
  });

  if (err.error){
    return resCb(webFaultHelper.getValidationFault(err.error));
  }

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  req.params = _.defaults(_.clone(req.params || {}), {
    url: ""
  });
  Resource.create(req.params)
  .then(function (data) {
    resCb.send(data);
  }).catch(function (err) {
    errCb(webFaultHelper.getFault(err));
  });
};
