"use strict";
var ifData = require('if-data')
var getReportChatHistory = ifData.repositories.getReportChatHistory;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topic_id: joi.number().required(),
        sessionStaffTypeToExclude: joi.number(), //will be excluded events, belonged to user, which has appropriate Session Staff role in a Topic
        starsOnly: joi.types.Boolean() //will be included only events w/ tag = 1. by turning this flag on the mode "Stars Only" is enabled
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    getReportChatHistory(req.params)
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