"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var BrandProjectPreference = models.BrandProjectPreference;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		sessionId: joi.number().required()
	});
	if (err)
	return resCb(webFaultHelper.getValidationFault(err.message));

	resCb();
};

module.exports.run = function (req, resCb, errCb) {
	BrandProjectPreference.find(req.params)
	.then(function(data) {
		resCb.send(data)
	})
	.catch(function(err) {
		errCb(webFaultHelper.getFault(err));
	});
};
