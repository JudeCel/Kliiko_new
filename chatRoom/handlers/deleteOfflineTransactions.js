"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require("joi");
var models = require("./../../models");
var OfflineTransaction = models.OfflineTransaction;

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topicId: joi.number().required(),
        reply_userId: joi.number().required()
    });

    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  OfflineTransaction.destroy({where: { topicId: req.params.topicId, reply_userId: params.replyUserId } })
  .then(function(data) {
    resCb.send(data)
  })
  .catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
