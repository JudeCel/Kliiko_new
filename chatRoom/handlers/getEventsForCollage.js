"use strict";
// var getEventsForCollage = require('if-data').repositories.getEventsForCollage;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var models = require("./../../models");

module.exports.validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topicId: joi.number().required()
    });

    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};

module.exports.run = function (req, resCb, errCb) {
  let params = req.params;
  let sql = 'SELECT id, "userId", event \
              FROM events  \
              WHERE "cmd" = \'collage\' AND "topicId" = 1 AND "deletedAt" IS NULL AND id IN \
                  (SELECT MAX(id)  \
                  FROM events  \
                  WHERE "cmd" = \'collage\' AND "topicId" = 1 AND "deletedAt" IS NULL \
                  GROUP BY "userId");'
	models.sequelize.query(sql,
		{ replacements: [params.topicId, params.topicId],
			type: models.sequelize.QueryTypes.SELECT} ).then(function(topics) {
			resCb.send(topics);
  }).catch(function(err) {
		errCb(webFaultHelper.getFault(err));
	});

};