"use strict";
// var getUserLogin = require('if-data').repositories.getUserLogin;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var User = models.User;

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        user_id: joi.number().required(),
        session_id: joi.number().required(),
        brand_project_id: joi.number().optional(),
        client_company_id: joi.number().optional()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {

  User.find({where: { id: req.params.sessionId }, include: [models.BrandProject] }).then(function(result) {
    console.log(result.BrandProject);
    resCb.send(result.BrandProject);
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
