"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var Resource = models.Resource;

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        id: joi.number(),
        resourceType: joi.string(),
        topicId: joi.number(),
        private: joi.boolean(),
        userId: joi.number()
    });
    if (err.error){
      return resCb(webFaultHelper.getValidationFault(err.error));
    }

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, nextCb) {
  Resource.findAll({where: req.params})
  .then(function (data) {
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
