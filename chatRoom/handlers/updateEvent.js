"use strict";
// var updateEvent = require('if-data').repositories.updateEvent;
var joi = require('joi');
var models = require("../models");
var Event = models.Event;
var webFaultHelper = require('../helpers/webFaultHelper.js');


module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number.required(),
        user_id: joi.number.optional(),
        topic_id: joi.number.required(),
        reply_id: joi.number.optional().nullOk(),
        cmd: joi.string.optional().nullOk(),
        tag: joi.number.required(),
        uid: joi.string.optional().nullOk(),
        event: joi.string.optional(),
        thumbs_up: joi.number.optional().nullOk(),
        timestamp: joi.number.optional(),
        created: joi.types.Object().optional().nullOk(),
        updated: joi.types.Object().optional().nullOk(),
        deleted: joi.types.Object().optional().nullOk()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

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
