"use strict";
var createSession = require('if-data').repositories.createSession;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, next) {
	var err = joi.validate(req.params, {
        brand_project_id: joi.number().required(),
        name: joi.string().max(200).required(),
        start_time: joi.string().required(),
        end_time: joi.string().required(),
        status_id: joi.number().required()
    });

	if (err){
		return next(webFaultHelper.getValidationFault(err));}

	next();
};

module.exports.run = function (req, resCb, errCb) {
	createSession(req.params)
		.done(function (data) {
            resCb.send(data);
		}, function(err) {
            errCb(webFaultHelper.getFault(err));
		});
};

