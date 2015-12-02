"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var _ = require('lodash');
var models = require("./../../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    sessionId: joi.number().required(),
    reply_userId: joi.number().required()
  });
  if (err)
  return resCb(webFaultHelper.getValidationFault(err.message));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let sessionId = req.params.sessionId;
  let replyUserId = req.params.reply_userId;

  OfflineTransaction.findAll(
    {where: {sessionId: sessionId, reply_userId: replyUserId}}).then(function(result) {
      let cloection  = _.map(result, function(n) {
        return n.dataValues;
      });
      resCb.send(cloection);
    }).catch(function(err) {
      errCb(webFaultHelper.getFault(err));
    });
  };
