"use strict";
// var createSessionStaff = require('if-data').repositories.createSessionStaff;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var SessionStaff = models.SessionStaff;

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
        userId: joi.number().required(),
        sessionId: joi.number().required(),
        type: joi.string().required(),
        active: joi.number().required()
    });

	if (err.error)
		return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
	SessionStaff.create(req.params)
	.then(function (data) {
       resCb.send(data);
   }).catch(function(err) {
     console.log(err);
     errCb(webFaultHelper.getFault(err));
   });
};
