"use strict";
// var ifData = require('if-data')
// var getReportWhiteboard = ifData.repositories.getReportWhiteboard;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var _ = require('lodash');
var models = require("./../../models");
var Event = models.Event;

var expressValidatorStub = require('../helpers/expressValidatorStub.js');

var validate = function (req, next) {
    var err = joi.validate(req.params, {
        topicId: joi.number().required()
    });
    if (err.error)
        return next(webFaultHelper.getValidationFault(err.error));

    next();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {
  Event.findAll({where: {topicId: req.params.topicId, cmd: ['object', 'shareresource'] }})
    .then(function (events) {
      let collection  = _.map(events, function(n) {
        let data = n.dataValues;
        return data;
      });
        resCb.send(collection);
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
