"use strict";
// var getReportTopics = require('if-data').repositories.getReportTopics;
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
  var	sql = 'SELECT t.id AS "topicId", t.name, s.name AS session_name, \
    bp.id AS brand_project_id, bp.name AS brand_project_name, \
    "ss"."userId" AS "facilitator_id" \
    FROM "Sessions" AS s \
    JOIN "topics" AS t ON "t"."sessionId" = s.id \
    LEFT JOIN "BrandProjects" AS bp ON "bp"."id" = "s"."brand_project_id" \
    LEFT JOIN "session_staff" AS ss ON "ss"."sessionId" = "s"."id" \
    WHERE "s"."id" = ? ORDER BY t.topic_order_id;'

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
