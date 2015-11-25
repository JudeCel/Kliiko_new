"use strict";
var createSessionStaff = require('if-data').repositories.createSessionStaff;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

module.exports.validate = function (req, resCb) {
	var err = joi.validate(req.params, {
        user_id: joi.types.Number().required(),
        session_id: joi.types.Number().required(),
        type_id: joi.types.Number().required(),
        active: joi.types.Number().required()
    });

	if (err)
		return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
	createSessionStaff(req.params)
		.done(function (newSessionStaff) {
            resCb.send(newSessionStaff);
		}, function(err) {
            errCb(webFaultHelper.getFault(err));
		});
};

