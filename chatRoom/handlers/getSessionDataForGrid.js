"use strict";
var getSessionStaff = require('if-data').repositories.getSessionDataForGrid;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        companyId: joi.types.Number(),
        limit: joi.types.String()
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};
module.exports.validate = validate

var run = function (req, resCb, errCb) {
    getSessionStaff(req.params)
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