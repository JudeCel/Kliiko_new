"use strict";
var _ = require("lodash");
// var createLog = require('if-data').repositories.createLog;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var dataHelper = require("../helpers/dataHelper.js");
var models = require("../models");
var Log = models.Log;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        user_id: joi.number.required(),
        timestamp: joi.number.optional(),
        type: joi.string.optional()
    });

    if (err)
        return next(webFaultHelper.getValidationFault(err));

    next();
};

module.exports.run = function (req, resCb, errCb) {
    req.params = _.defaults(_.clone(req.params || {}), {
        timestamp: dataHelper.getTimestamp()
    });

    Log.create(req.params)
    .then(function(data) {
      resCb.send(data)
    })
    .catch(function(err) {
      errCb(webFaultHelper.getFault(err));
    });
};
