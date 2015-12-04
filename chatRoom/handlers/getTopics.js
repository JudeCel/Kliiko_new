"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Topic = models.Topic;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		sessionId: joi.number().required()
	});
	if (err.error)
		return resCb(webFaultHelper.getValidationFault(err.error));

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
