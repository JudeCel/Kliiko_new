"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");


var validate = function (req, next) {
    var err = joi.validate(req.params, {
        sessionId: joi.number().required()
    });
    if (err.error){
      return next(webFaultHelper.getValidationFault(err.error));
    }

    next();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  let sql = 'SELECT e."userId", \
     COUNT(e."userId") AS "countUserId", \
     t.id AS "topicId", \
     t.name AS "topicName", \
     u."firstName" \
     FROM events AS e INNER JOIN topics AS t ON \
     e."topicId" = t.id \
     INNER JOIN "Users" AS u ON \
     e."userId" = u.id \
     WHERE e."deletedAt" IS NULL AND t."deletedAt" IS NULL AND e.cmd = \'chat\' AND t."sessionId" = ? \
     GROUP BY e."userId", e."topicId", t.id, u."firstName", topic_order_id';

      models.sequelize.query(sql,
       { replacements: [req.params.sessionId] }
     ).then(function (data) {
        console.log(data);
        resCb.send(data[0]);
      })
      .catch(function(err) {
         console.log(err);
         errCb(webFaultHelper.getFault(err));
     });
}
module.exports.run = run;

module.exports.execute = function (params, resCb, nextCb) {
    var req = expressValidatorStub({
        params: params
    });

    var res = { send: resCb };
    validate(req, function (err) {
        if (err) return nextCb(err);
        run(req, res, nextCb);
    });
}
