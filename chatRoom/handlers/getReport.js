"use strict";

// var getReport = require('if-data').repositories.getReport;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');

var models = require("./../../models");

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        sessionId: joi.number().required()
    });
    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  var sql = 'SELECT\
    "e"."id",\
    "e"."replyId" AS "reply_id",\
    "e"."tag",\
    "e"."userId",\
    t.id AS topicId,\
    t.name AS topic_name,\
    (SELECT "firstName" FROM "Users" WHERE "Users"."id" = "e"."userId"),\
    "e"."createdAt",\
    "e"."event"\
  FROM events AS e\
  JOIN topics as t ON t.id = "e"."topicId"\
  WHERE "e"."deletedAt" IS NULL\
    AND "t"."deletedAt" IS NULL\
    AND	"t"."sessionId" = 1\
    AND "e"."cmd" = \'chat\' \
  ORDER BY "e"."createdAt" ASC;'

  models.sequelize.query(sql,
  { replacements: [req.params.sessionId],
   type: models.sequelize.QueryTypes.SELECT }
 ).then(function (data) {
      resCb.send(data);
  }).catch(function(err) {
    console.log(err);
    errCb(webFaultHelper.getFault(err));
  });
};
