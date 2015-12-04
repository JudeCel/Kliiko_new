"use strict";
var joi = require('joi');
var models = require("./../../models");
var Event = models.Event;
var webFaultHelper = require('../helpers/webFaultHelper.js');


module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number().required(),
        userId: joi.number().optional(),
        topicId: joi.number().required(),
        reply_id: joi.number().optional(),
        cmd: joi.string().optional(),
        tag: joi.number().required(),
        uid: joi.string().optional(),
        event: joi.string().optional(),
        thumbs_up: joi.number().optional(),
        timestamp: joi.number().optional(),
    });

    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let params = req.params;
  Event.find({ where: {id: params.id} }).done(function(result) {
    if (result) {
      result.updateAttributes(params).then(function(result) {
        if (resCb) {
          resCb.send({
              opResult: result,
              fields: params
          });
        }
      }).catch(function(err) {
        errCb(webFaultHelper.getFault(err));
      });
    }
  });
};
