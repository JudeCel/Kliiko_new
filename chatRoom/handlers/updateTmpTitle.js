"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var Resource = models.Resource;

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        topicId: joi.number().optional(),
        userId: joi.number().optional(),
        JSON: joi.object().required(),
        URL: joi.string().required()
    });
    if (err.error){
      return resCb(webFaultHelper.getValidationFault(err.error));
    }

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  Resource.destroy({where: {resource_type: 'tmp', userId: req.params.userId }})
    .then(function () {
      Resource.create({
          topicId: req.params.topicId,
          userId: req.params.userId,
          URL: req.params.URL,
          resource_type: 'tmp',
          JSON: encodeURI(JSON.stringify(req.params.JSON, null))
      }).catch(function (err) {
          errCb(webFaultHelper.getFault(err));
      });
    }).then(function (data) {
        resCb.send(data);
    }).catch(function (err) {
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
