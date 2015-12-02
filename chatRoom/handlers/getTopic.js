"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Topic = models.Topic;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		topicId: joi.number().required()
	});
	if (err)
		return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
	let topicId = req.params.topicId;
	Topic.find({where: topicId}).then(function(result) {
			resCb.send(result);
	}).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
