"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Event = models.Event;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    topicId: joi.number().required()
  });

  if (err.error){
    return resCb(webFaultHelper.getValidationFault(err.error));
  }

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  Event.find({where: {topicId: req.params.topicId, tag: 32},
    order: [['id', 'DESC']] }).then(function(event) {
      resCb.send(event || []);
    }).catch(function(err) {
      console.log(err);
      errCb(webFaultHelper.getFault(err));
    });
  };
