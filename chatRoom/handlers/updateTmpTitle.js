"use strict";
var deleteUserTmpResources = require('if-data').repositories.deleteUserTmpResources;
var createResource = require('if-data').repositories.createResource;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var mtypes = require('if-common').mtypes;
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topic_id: joi.number().nullOk().optional(),
        userId: joi.number().nullOk().optional(),
        JSON: joi.types.Object().required(),
        URL: joi.string().required()
    });
    if (err)
        return resCb(webFaultHelper.getValidationFault(err.message));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
    deleteUserTmpResources(req.params)
        .then(function () {
            return createResource({
                topic_id: req.params.topic_id,
                userId: req.params.userId,
                URL: req.params.URL,
                type_id: mtypes.resourceType.tmp,
                JSON: encodeURI(JSON.stringify(req.params.JSON, null))
            });
        })
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