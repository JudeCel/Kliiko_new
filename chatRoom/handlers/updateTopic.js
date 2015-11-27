"use strict";
var updateTopic = require('if-data').repositories.updateTopic;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("../models");
var Topic = models.Topic;

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topic_id: joi.number.required(),
	    description: joi.string.optional()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let id = req.params.topic_id;
  let description = req.params.description;

    let fields = {
	    id: id,
      description: description
    };

    Topic.update({description: description }, {where: {id: id}})
      .then(function(data) {
        resCb.send({
          opResult: data,
          fields: fields
        });
      })
      .catch(function(err) {
        errCb(webFaultHelper.getFault(err));
    });
};
