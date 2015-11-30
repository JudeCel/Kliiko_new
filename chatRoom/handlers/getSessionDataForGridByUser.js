"use strict";
var getSessionUser = require('if-data').repositories.getSessionDataForGridByUser;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        type: joi.number().required(),
        userId: joi.number().required(),
        sidx: joi.string().required(),
        sord: joi.string().required(),
        start: joi.number().required(),
        limit: joi.number().required(),
        companyId: joi.number()
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};
module.exports.validate = validate

var run = function (req, resCb, errCb) {
    getSessionUser(req.params)
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