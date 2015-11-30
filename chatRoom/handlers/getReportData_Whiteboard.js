"use strict";
var ifData = require('if-data')
var getReportWhiteboard = ifData.repositories.getReportWhiteboard;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topic_id: joi.number().required()
    });
    if (err)
        return next(webFaultHelper.getValidationFault(err.message));

    next();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    getReportWhiteboard.getFirstEvent(req.params)
        .then(function (event) {
            return getReportWhiteboard.getResult(req.params, event);
        })
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