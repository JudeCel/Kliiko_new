"use strict";
var ifData = require('if-data');
var getResourcesGeneric = ifData.repositories.getResourcesGeneric;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number(),
        type_id: joi.number(),
        topic_id: joi.number(),
        userId: joi.number()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, nextCb) {
    getResourcesGeneric(req.params)
        .done(function (data) {
            resCb.send(data);
        }, function (err) {
            nextCb(webFaultHelper.getFault(err));
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
