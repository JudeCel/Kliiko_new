"use strict";
var getAvatarInfo = require('if-data').repositories.getAvatarInfo;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, errCb) {
    var err = joi.validate(req.params, {
        userId: joi.number.required(),
        sessionId: joi.number.required()
    });

    if (err)
        return errCb(webFaultHelper.getValidationFault(err.message));

    errCb();
};

module.exports.run = function (req, resCb, errCb) {
    getAvatarInfo(req.params)
        .done(function (data) {
            resCb.send(data);
        }, errCb);
};