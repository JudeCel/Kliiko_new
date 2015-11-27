"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require("joi");
var models = require("../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topic_id: joi.number.required(),
        reply_user_id: joi.number.required()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  OfflineTransaction.destroy({where: { topic_id: req.params.topicId, reply_user_id: params.replyUserId } })
  .then(function(data) {
    resCb.send(data)
  })
  .catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
