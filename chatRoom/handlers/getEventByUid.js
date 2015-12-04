"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var Event = models.Event;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    uid: joi.string().max(64).required()
  });
  if (err.error)
    return resCb(webFaultHelper.getValidationFault(err.error));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  Event.find({where: {uid: req.params.uid}}).then(function(result) {
    if (result) {
      resCb.send(result.dataValues);

    }else{
      resCb.send(null);
    }
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
