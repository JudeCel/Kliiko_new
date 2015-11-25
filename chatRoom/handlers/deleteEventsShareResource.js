"use strict";
var _ = require('lodash');
var deleteEvents = require("if-data").repositories.deleteEventsShareResource;
var ifData = require('if-data'), db = ifData.db;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var Q = require('q');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topic_id: joi.types.Number().required()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    deleteEvents(req.params)
        .done(function (resObj) {
            resCb.send();
        }, errCb);
};
