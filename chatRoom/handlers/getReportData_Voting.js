"use strict";
var ifData = require('if-data')
var getReportVoting = ifData.repositories.getReportVoting;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topic_id: joi.types.Number().required(),
        sessionStaffTypeToExclude: joi.types.Number().optional() //will be excluded events, belonged to user, which has appropriate Session Staff role in a Topic
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};

module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    getReportVoting(req.params)
        .done(function (data) {
            resCb.send(data);
        }, function (err) {
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