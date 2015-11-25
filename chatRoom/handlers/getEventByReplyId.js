"use strict";
var getEventByReplyId = require('if-data').repositories.getEventByReplyId;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        reply_id: joi.types.Number().required()
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};

module.exports.run = function (req, resCb, errCb) {
    getEventByReplyId(req.params)
        .done(function (event) {
            resCb.send(event);
        }, function (err) {
            errCb(webFaultHelper.getFault(err));
        })
};