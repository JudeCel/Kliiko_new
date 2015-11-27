"use strict";
var getBrandProjectInfo = require('if-data').repositories.getBrandProjectInfo;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        sessionId: joi.number.required()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    getBrandProjectInfo(req.params)
        .done(function (data) {
            resCb.send(data);
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};