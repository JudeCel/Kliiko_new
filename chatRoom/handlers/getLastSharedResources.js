"use strict";
var getLastSharedResources = require('if-data').repositories.getLastSharedResources;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");

module.exports.validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    topicId: joi.number().required()
  });
  if (err)
  return resCb(webFaultHelper.getValidationFault(err.message));

  resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let sql = "SELECT e1.* \
    FROM events e1 LEFT JOIN events e2 \
    ON (e1.cmd = e2.cmd AND e1.tag = e2.tag AND e1.topicId = e2.topicId AND e1.id < e2.id ) \
    WHERE e2.id IS NULL AND \
    e1.deletedAt IS NULL AND \
    e1.tag != 0 AND /*NOT interested IN images, buildChatHistory.js will take care of them*/ \
    e1.cmd = 'shareresource' AND \
    e1.topicId = ? \
    order by updatedAt";

  models.sequelize.query(sql,
    { replacements: [req.params.topicId],
      type: models.sequelize.QueryTypes.SELECT} ).then(function(event) {
        console.log(event);
        resCb.send(event);
      }).catch(function(err) {
        errCb(webFaultHelper.getFault(err));
      });
    }
