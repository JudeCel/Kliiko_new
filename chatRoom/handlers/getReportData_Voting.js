"use strict";
// var ifData = require('if-data')
// var getReportVoting = ifData.repositories.getReportVoting;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topicId: joi.number().required(),
        sessionStaffTypeToExclude: joi.number().optional() //will be excluded events, belonged to user, which has appropriate Session Staff role in a Topic
    });
    if (err.error){
      return next(webFaultHelper.getValidationFault(err.error))
    };

    next();
};

module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  let params = req.params;

  let sql = 'SELECT e.id, e."userId", u."firstName", e."topicId", e."replyId", e.cmd, e.tag, e.event, e."createdAt" \
    FROM events AS e INNER JOIN "Users" u ON \
    e."userId" = u.id \
    WHERE e."topicId" = ? AND e."deletedAt" IS NULL AND e.cmd = \'vote\'';

    if (params.sessionStaffTypeToExclude){
        sql += 'AND u.id NOT IN (SELECT DISTINCT "userId" \
                    FROM session_staff WHERE "deletedAt" IS NULL \
                    AND "typeId" = ' + params.sessionStaffTypeToExclude + ')';
    }
    sql += 'ORDER BY e."replyId", e."createdAt" ASC';

  models.sequelize.query(sql,
    { replacements: [req.params.topicId],
     type: models.sequelize.QueryTypes.SELECT }
   ).then(function (data) {
        resCb.send(data);
    }).catch(function(err) {
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
