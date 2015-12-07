"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");
var Event = models.Event

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    eventId: joi.number().required()
  });

  if (err.error){
    return resCb(webFaultHelper.getValidationFault(err.error));
  }
  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let eventId = req.params.eventId
  Event.destroy({
    where: {
      $or: [{ id: eventId }, {replyId: eventId }]
    }
  })
  .then(function(_result) {
    Event.findAll({where: {replyId: eventId}, attributes: ['id', 'topicId']})
    .then(function(replies) {
      resCb.send({ deletedReplies: replies });
    }).catch(function(err) {
      errCb(webFaultHelper.getFault(err));
    });
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
