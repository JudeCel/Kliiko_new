"use strict";
var deleteOfflineTransactions = require('if-data').repositories.deleteOfflineTransactions;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require("joi");

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topic_id: joi.number.required(),
        reply_user_id: joi.number.required()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    deleteOfflineTransactions(req.params)
        .done(function () {
            resCb.send();
        }, errCb);
};