"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var Topic = models.Topic;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		topicId: joi.number().required()
	});
	if (err.error)
		return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
	let topicId = req.params.topicId;
	Topic.find({where: {id: topicId}}).then(function(result) {
		resCb.send(result.dataValues);
	}).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
