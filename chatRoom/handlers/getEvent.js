"use strict";
var getEvent = require('if-data').repositories.getEvent;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var Event = models.Event;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        event_id: joi.number().required()
    });
    if (err.error)
        return next(webFaultHelper.getValidationFault(err.error));

    next();
};

module.exports.run = function (req, resCb, errCb) {
  Event.find({where: {id: req.params.event_id} }).then(function(result) {
			resCb.send(result);
	}).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
