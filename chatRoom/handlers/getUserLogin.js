"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var SessionMember = models.SessionMember;

var validate = function (req, resCb) {
  var err = joi.validate(req.params, {
    userId: joi.number().required(),
    sessionId: joi.number().required(),
    // brand_project_id: joi.number().optional(),
  });
  if (err)
  return resCb(webFaultHelper.getValidationFault(err.message));

  resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  SessionMember.find({
    where: { userId: req.params.userId,  sessionId: req.params.sessionId },
    attributes: ['userId', 'username', 'colour', 'online', 'avatar_info', 'sessionId', 'role'],
    include: [ { model: models.User, attributes: ['firstName', 'lastName'] }] })
  .then(function(result) {
    buildResponse(result, function(error, member) {
      resCb.send(member);
    })
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });
};
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

function buildResponse(member, callback) {
  let data = member.dataValues;
  data.fullName = member.User.firstName +" "+ member.User.lastName
  data.name = data.username; // chat specific
	callback(null, data)
}
