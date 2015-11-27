"use strict";
var getUserLogin = require('if-data').repositories.getUserLogin;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        user_id: joi.number.required(),
        session_id: joi.number.required(),
        brand_project_id: joi.number.optional(),
        client_company_id: joi.number.optional()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    getUserLogin(req.params)
        .done(function (data) {
            resCb.send(data);
        }, function (err) {
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