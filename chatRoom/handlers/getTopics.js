"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Topic = models.Topic;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		sessionId: joi.number().required()
	});
	if (err)
	return resCb(webFaultHelper.getValidationFault(err.message));

	resCb();
};

module.exports.run = function (req, resCb, errCb) {
	Topic.findAll({where: { sessionId: req.params.sessionId }})
	.then(function(topics) {
		resCb.send(topics);
	}).catch(function(err) {
		errCb(webFaultHelper.getFault(err));
	});
};
