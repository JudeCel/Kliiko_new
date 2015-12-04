"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var _ = require('lodash');
var models = require("./../../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    sessionId: joi.number().required(),
    replyUserId: joi.number().required()
  });
  
  if (err.error){
    return resCb(webFaultHelper.getValidationFault(err.error));
  }

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  console.log(req.params);
  let sessionId = req.params.sessionId;
  let replyUserId = req.params.replyUserId;

  OfflineTransaction.findAll(
    {where: {sessionId: sessionId, replyUserId: replyUserId}}).then(function(result) {
      let cloection  = _.map(result, function(n) {
        return n.dataValues;
      });
      resCb.send(cloection);
    }).catch(function(err) {
      errCb(webFaultHelper.getFault(err));
    });
  };
