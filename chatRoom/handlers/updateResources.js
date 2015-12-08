"use strict";
var updateResources = require('if-data').repositories.updateResources;
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number().required(),
        type_id: joi.number().optional(),
        url: joi.string().optional()
    });

    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

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
