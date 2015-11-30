"use strict";
var _ = require("lodash");
var createResource = require("if-data").repositories.createResource;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        type_id: joi.number().required(),
        url: joi.string().optional(),
        topic_id: joi.number().optional(),
        user_id: joi.number().optional(),
        JSON: joi.string().optional()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    req.params = _.defaults(_.clone(req.params || {}), {
        url: ""
    });

    createResource(req.params)
        .done(function (data) {
            resCb.send(data);
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};