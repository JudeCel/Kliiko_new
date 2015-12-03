"use strict";
var getEventsForToggle = require('if-data').repositories.getEventsForToggle;
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
  let sql =  "SELECT event \
        FROM events \
        WHERE id = (SELECT MAX(id) FROM events WHERE tag = 32 AND topicId = ? AND deletedAt IS NULL)";

    models.sequelize.query(sql,
    { replacements: [req.params.topicId],
      type: models.sequelize.QueryTypes.SELECT } ).then(function(event) {
        resCb.send(event);
      }).catch(function(err) {
        errCb(webFaultHelper.getFault(err));
      });
};
