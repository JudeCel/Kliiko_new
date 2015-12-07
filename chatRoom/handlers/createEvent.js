"use strict";
var _ = require('lodash');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Event = models.Event;

var dataHelper = require("../helpers/dataHelper.js");

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    userId: joi.number().required(),
    topicId: joi.number().required(),
    tag: joi.number().required(),
    timestamp: joi.number().optional(),
    cmd: joi.string().optional(),
    event: joi.string().optional(),
    uid: joi.string().optional(),
    replyId: joi.number().optional()
  });

  if (err.error){
    return resCb(webFaultHelper.getValidationFault(err.error));
  }

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let params = _.defaults(_.clone(req.params || {}), {
    timestamp: dataHelper.getTimestamp()
  });

  Event.create(params)
  .then(function(data) {
    resCb.send(data)
  })
  .catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });

};
