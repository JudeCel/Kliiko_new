"use strict";
var updateResources = require('if-data').repositories.updateResources;
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.types.Number().required(),
        type_id: joi.types.Number().optional(),
        url: joi.types.String().optional()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    var fields = {
        id: req.params.id,
        type_id: req.params.type_id,
        url: req.params.url
    };
    updateResources(fields)
        .done(function (opResult) {
            resCb.send({
                opResult: opResult,
                fields: fields
            });
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};