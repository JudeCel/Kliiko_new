"use strict";
var deleteEvent = require('if-data').repositories.deleteEvent;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require("joi");
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');
var models = require("../models");
var Event = models.Event;

var validate = function (req, resCb) {
    if (!req.params.event_id && !req.params.uid)
        return resCb("At least one parameter is required");

    var err = joi.validate(req.params, {
        event_id: joi.types.Number().optional(),
        uid: joi.types.String().optional()
    });

    if (err)
        return resCb(webFaultHelper.getValidationFault(err));

    resCb();
};
module.exports.validate = validate;

var run = function (req, resCb, errCb) {

  Event.destroy({where: { uid: [req.params.uid] } })
  .then(function(data) {
    resCb.send(data)
  })
  .catch(function(err) {
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
