"use strict";
var getEventsForToggle = require('if-data').repositories.getEventsForToggle;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topicId: joi.number.required()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    getEventsForToggle(req.params)
        .done(function (event) {
            resCb.send(event);
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        });
};