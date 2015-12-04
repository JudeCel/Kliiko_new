"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var _ = require('lodash');
var SessionMember = models.SessionMember;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		sessionId: joi.number().required(),
	});
	if (err.error)
		return resCb(webFaultHelper.getValidationFault(err.error));
};

module.exports.run = function (req, resCb, errCb) {
	let params = req.params;
	SessionMember.findAll({
    where: { sessionId: req.params.sessionId },
    attributes: ['userId', 'username', 'colour', 'online', 'avatar_info', 'sessionId', 'role'],
		include: [ { model: models.User, attributes: ['firstName', 'lastName'] }]
  })
	.then(function(result) {
		buildResponse(result, function(error, members) {
			resCb.send(members);
		})
  }).catch(function(err) {
			console.log(err);
		errCb(webFaultHelper.getFault(err));
	});
};

function buildResponse(members, callback) {
	let list  = _.map(members, function(n) {
		let data = n.dataValues;
		data.fullName = n.User.firstName +" "+ n.User.lastName;
		data.name = data.username; // chat specific
		return data;
	});
	callback(null, list)
}
