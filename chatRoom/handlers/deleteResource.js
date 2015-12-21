"use strict";
var _ = require('lodash');

var webFaultHelper = require('../helpers/webFaultHelper.js');
var Q = require('q');
var joi = require('joi');
var models = require("./../../models");
var Resource = models.Resource;

module.exports.validate = function (req, next) {
	var err = joi.validate(req.params, {
		resource_id: joi.number().required()
	});
	if (err.error){
		return next(webFaultHelper.getValidationFault(err.error));
	}

	next();
};

module.exports.run = function (req, res, mainCb) {
	Resource.destroy({where: {id: req.params.resource_id}})
		.then(function(_data) {
	    res.send(null);
	  })
	  .catch(function(err) {
	    mainCb(webFaultHelper.getFault(err));
	  });
};
