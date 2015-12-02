"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var Session = models.Session;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    sessionId: joi.number().required()
  });

  if (err)
  return resCb(webFaultHelper.getValidationFault(err.message));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  Session.find({where: { id: req.params.sessionId }, include: [models.BrandProject] }).then(function(result) {
    resCb.send(result.BrandProject);
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
