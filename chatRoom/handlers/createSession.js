"use strict";
var createSession = require('if-data').repositories.createSession;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, next) {
	var err = joi.validate(req.params, {
        brand_project_id: joi.types.Number().required(),
        name: joi.types.String().max(200).required(),
        start_time: joi.types.String().required(),
        end_time: joi.types.String().required(),
        status_id: joi.types.Number().required()
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

