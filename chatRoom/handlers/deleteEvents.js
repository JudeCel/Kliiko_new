"use strict";
var _ = require('lodash');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var Event = models.Event;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, { topicId: joi.number().required() });

	if (err.error)
		return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
	Event.destroy({
		where: {
			topicId: req.params.topicId,
			tag: { $in: [0, 16] },
			cmd: { $in: ['shareresource', 'object'] }
		}
	})
	.then(function(result) {
		resCb.send();
	}).catch(function(err) {
		errCb(webFaultHelper.getFault(err));
	});
};
