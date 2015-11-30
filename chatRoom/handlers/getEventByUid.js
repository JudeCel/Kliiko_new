"use strict";
var getEventByUid = require('if-data').repositories.getEventByUid;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        uid: joi.string().max(64).required()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    getEventByUid(req.params)
        .done(function (event) {
            resCb.send(event);
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        })
};