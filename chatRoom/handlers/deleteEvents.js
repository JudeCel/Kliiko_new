"use strict";
var _ = require('lodash');
var deleteEvents = require("if-data").repositories.deleteEvents;

var ifData = require('if-data'), db = ifData.db;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var Q = require('q');
var joi = require('joi');

var models = require("./../../models");

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		topic_id: joi.number().required()
	});

	if (err)
		return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {

	let sql = "UPDATE events \
		SET deleted = NOW() \
		WHERE deleted IS NULL \
		AND (tag = 0 OR tag = 16) \
		AND cmd IN ('shareresource', 'object') \
		AND topic_id = ?";


		models.sequelize.query(sql,
			{ replacements: [req.params.topic_id],
				type: models.sequelize.QueryTypes.UPDATE} ).then(function(result) {
				resCb.send();
	  }).catch(function(err) {
			errCb(webFaultHelper.getFault(err));
		});};
