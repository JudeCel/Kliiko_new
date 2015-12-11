"use strict";
// var getSessionStaffUserIds = require('if-data').repositories.getSessionStaffUserIds;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var SessionStaff = models.SessionStaff;

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        type: joi.string(),
        sessionId: joi.number()
    });
    if (err.error){
      return next(webFaultHelper.getValidationFault(err.error));
    }

    next();
};
module.exports.validate = validate

var run = function (req, resCb, errCb) {
  SessionStaff.findAll({where: req.params, distinct: true})
  .then(function (data) {
       resCb.send(data);
   }).catch(function(err) {
     console.log(err);
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
