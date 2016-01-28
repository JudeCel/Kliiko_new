"use strict";
var get = require('if-data').repositories.getClientCompanyLogo;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number().required()
    });
    if (err.error)
        return resCb(webFaultHelper.getValidationFault(err.error));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    get(req.params)
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