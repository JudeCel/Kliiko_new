"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");
var _ = require('lodash');
var SessionMember = models.SessionMember;
var User = models.User;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
		session_id: joi.number().required(),
	});
	if (err)
		return resCb(webFaultHelper.getValidationFault(err.message));
};

module.exports.run = function (req, resCb, errCb) {
	let params = req.params;
	User.findAll({ attributes: ['firstName', 'lastName', 'email'],
		include: [
		{ model: models.SessionMember,
			where: { session_id: params.session_id}
		}]
	})
	.then(function(users) {
		buildResponse(users, function(error, result) {
			resCb.send(result);
		})
  }).catch(function(err) {
			console.log(err);
		errCb(webFaultHelper.getFault(err));
	});
};

function buildResponse(users, callback) {
	let cloection  = _.map(users, function(n) {
		let data = n.dataValues;
		data.roles = [];
		_.each(n.SessionMembers, function(sm) {
			data.roles.push(sm.role);
		});
		return data;
	});
	callback(null, cloection)
}
