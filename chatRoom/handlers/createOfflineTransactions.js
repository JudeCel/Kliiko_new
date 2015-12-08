"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        userId: joi.number().required(),
        sessionId: joi.number().required(),
        topicId: joi.number().required()
    });
    if (err.error)
      return next(webFaultHelper.getValidationFault(err.error));

    next();
};

module.exports.run = function (req, resCb, errCb) {
    createOfflineTransaction(req.params)
        .done(function (data) {
            resCb.send(data)
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};
