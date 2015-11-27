"use strict";
var ifData = require('if-data');
var deleteChat = ifData.repositories.deleteChat;//, db = ifData.db;
var getReplies = ifData.repositories.getReplies;//, db = ifData.db;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        event_id: joi.number.required()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
    deleteChat(req.params)
        .then(getReplies(req.params))
        .done(function (data) {
            resCb.send({
                    deletedReplies: data
                }
            );
        }, errCb);
};