"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        user_id: joi.types.Number().required(),
        session_id: joi.types.Number().required(),
        topic_id: joi.types.Number().required()
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

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
