"use strict";
var _ = require('lodash');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("../models");
var Event = models.Event;

var dataHelper = require("../helpers/dataHelper.js");

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        user_id: joi.types.Number().required(),
        topic_id: joi.types.Number().required(),
        tag: joi.types.Number().required(),
        timestamp: joi.types.Number().optional(),
        cmd: joi.types.String().optional(),
        event: joi.types.String().optional(),
        uid: joi.types.String().optional(),
        reply_id: joi.types.Number().optional()
    });

    if (err){
      return resCb(webFaultHelper.getValidationFault(err.message));
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
