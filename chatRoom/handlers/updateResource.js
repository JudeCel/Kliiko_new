"use strict";
var updateResource = require('if-data').repositories.updateResources;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number().required(),
        JSON: joi.types.Object().required()
    });
    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    var fields = {
        id: req.params.id,
        JSON: encodeURI(JSON.stringify(req.params.JSON, null))
    };

    updateResource(fields)
        .done(function (opResult) {
            resCb.send({
                opResult: opResult,
                fields: fields
            });
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};
