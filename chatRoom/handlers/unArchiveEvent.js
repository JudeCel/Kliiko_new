"use strict";
var _ = require('lodash');
var ifData = require('if-data'), db = ifData.db;
var webFaultHelper = require('../helpers/webFaultHelper.js');

module.exports.validate = function (req, next) {
	if (!req.params.event_id)
		return next(webFaultHelper.getValidationFault("Cannot delete event with undefined id"));

	next();
};

module.exports.run = function (req, res, mainCb) {
	markEventDeleted(req.params.event_id)
		.done(function () {
			res.send();
		}, mainCb);

	function markEventDeleted(eventId) {
		var	sql = "UPDATE events SET deleted = NULL WHERE id = ?";
		return Q.nfcall(db.query, sql, [eventId]);
	}
};