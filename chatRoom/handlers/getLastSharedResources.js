"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Event = models.Event;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    topicId: joi.number().required()
  });
  if (err.error)
    return resCb(webFaultHelper.getValidationFault(err.error));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  Event.findAll({ where: {tag: {$ne: 0}, cmd: 'shareresource', topicId: req.params.topicId },
    order: ['updatedAt']})
    .then(function(events) {
      console.log(events);
      resCb.send(events);
    }).catch(function(err) {
      errCb(webFaultHelper.getFault(err));
    });
  }
