"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var models = require("./../../models");
var Resource = models.Resource;

var validate = function (req, resCb) {
    var err = joi.validate(req.params, {
        private: joi.boolean().optional(),
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

var run = function (req, resCb, errCb) {

  Resource.destroy({where: {resourceType: 'tmp', userId: req.params.userId }})
    .then(function () {
      createResurce(req.params, function(err, reult) {
        if (err) {
          errCb(webFaultHelper.getFault(err));
        }else{
          resCb.send(reult);
        }
      });
    }).catch(function (err) {
      errCb(webFaultHelper.getFault(err));
    });
};

function createResurce(params, callback) {
  Resource.create({
    private: params.private,
    topicId: params.topicId,
    userId: params.userId,
    URL: params.URL,
    resourceType: 'tmp',
    JSON: encodeURI(JSON.stringify(params.JSON, null))
  }).then(function (data) {
    callback(null, data.dataValues);
  }).catch(function (err) {
    callback(err);
  });
}

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

module.exports.validate = validate;
module.exports.run = run;
