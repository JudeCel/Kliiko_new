"use strict";
var updateUser = require('if-data').repositories.updateUser;
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var Q = require('q');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number().required(),
        avatar_info: joi.string().required()
    });

    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    var fields = {
        id: req.params.id,
        avatar_info: req.params.avatar_info
    };
    updateUser(fields)
        .done(function (opResult) {
            resCb.send({
                opResult: opResult,
                fields: fields
            });
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};
