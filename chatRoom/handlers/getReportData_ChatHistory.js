"use strict";
// var getReportChatHistory = ifData.repositories.getReportChatHistory;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topicId: joi.number().required(),
        sessionStaffTypeToExclude: joi.number(), //will be excluded events, belonged to user, which has appropriate Session Staff role in a Topic
        starsOnly: joi.boolean() //will be included only events w/ tag = 1. by turning this flag on the mode "Stars Only" is enabled
    });
    if (err.error){
      return next(webFaultHelper.getValidationFault(err.error));
    }

    next();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  let sql = "SELECT id, userId, firstName, topicId, replyId, cmd, tag, n.event from \
          \
      (SELECT e.id, e.userId, u.firstName, e.topicId, e.replyId, e.cmd, e.tag, e.event, grp.t as grp_t, grp.id as grp_id \
          FROM events AS e INNER JOIN users u ON \
      e.userId = u.id \
      INNER JOIN topics t ON \
      e.topicId = t.id \
      INNER JOIN sessions s ON \
      t.session_id = s.id \
      INNER JOIN (SELECT sub_e.id, sub_e.replyId, sub_e.created, IF(sub_e.replyId IS NULL, sub_e.id, sub_e.replyId) AS t \
      FROM events sub_e GROUP BY t, sub_e.id) grp \
      ON e.id = grp.id \
      WHERE t.id = ? \
      AND e.deleted IS NULL \
      AND e.cmd = 'chat'";

      if (params.starsOnly)
          sql += " AND e.tag = 1 ";
      if (params.sessionStaffTypeToExclude)
          sql += " AND u.id NOT IN (SELECT DISTINCT userId FROM session_staff WHERE deleted IS NULL AND type_id = " + params.sessionStaffTypeToExclude + ")";

      //sql += " ORDER BY grp.t, grp.id ASC";
      sql += "\
      UNION \
      \
      SELECT 0 as id, 0 as userId, 'Description' as firstName, t.id as topicId, null as replyId, 'chat' as cmd, 0 as tag, t.description as event, grp.t as grp_t, grp.id as grp_id \
      FROM topics t INNER JOIN (SELECT 0 as t, 0 as id ) grp ON grp.id=0 \
      where t.id = ? \
      )	n \
      \
      ORDER BY grp_t, grp_id ASC";


  models.sequelize.query(sql,
    { replacements: [req.params.topicId, req.params.topicId],
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
