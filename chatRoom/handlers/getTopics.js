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
	let sql = "SELECT \
			t.id, \
			t.name, \
			s.name AS session_name, \
			sl.name AS status, \
			IF (t.id = s.active_topic_id, 'true', 'false') AS active_topic, \
			DATE_FORMAT (s.start_time, '%Y-%m-%d %H:%i:%s') AS start_time, \
			DATE_FORMAT (s.end_time, '%Y-%m-%d %H:%i:%s') AS end_time, \
			UNIX_TIMESTAMP(s.start_time) AS start_time_timestamp, \
			UNIX_TIMESTAMP(s.end_time) AS end_time_timestamp \
		FROM topics t \
		JOIN sessions s ON s.id = t.sessionId \
		JOIN status_lookup sl ON sl.id = t.topic_status_id \
		WHERE t.deleted IS NULL AND t.sessionId = ? \
		ORDER BY t.topic_order_id";


	models.sequelize.query(sql,
		{ replacements: [req.params.sessionId],
			type: models.sequelize.QueryTypes.SELECT} ).then(function(topics) {
			resCb.send(topics);
  }).catch(function(err) {
		errCb(webFaultHelper.getFault(err));
	});
};
