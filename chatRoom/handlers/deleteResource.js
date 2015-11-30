"use strict";
var _ = require('lodash');
var ifData = require('if-data'), db = ifData.db;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var Q = require('q');
var joi = require('joi');

module.exports.validate = function (req, next) {
	var err = joi.validate(req.params, {
		resource_id: joi.number().required()
	});
	if (err)
		return next(webFaultHelper.getValidationFault(err.message));

	next();
};

module.exports.run = function (req, res, mainCb) {
	deleteResource(req.params.resource_id)
		.done(function (resObj) {
			res.send(null);
		}, mainCb);

	function deleteResource(resource_id) {
		var	sql = "DELETE FROM resources WHERE id = ?";
		return Q.nfcall(db.query, sql, [resource_id]);
	}
};