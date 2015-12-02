"use strict";
var getChats = require("if-data").repositories.getChats;
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var _ = require('lodash');
var models = require("./../../models");
var Event = models.Event;


module.exports.validate = function (req, next) {
  var err = joi.validate(req.params, {
    topicId: joi.number().required()
  });
  if (err)
  return next(webFaultHelper.getValidationFault(err.message));

  next();
};

module.exports.run = function (req, resCb, errCb) {
  let topicId = req.params.topicId;

  Event.findAll({ where: {topicId: topicId, cmd: 'chat', deleted: null },
  include: [models.Vote],
  order: [['created', 'DESC']] }).then(function(result) {

    let cloection  = _.map(result, function(n) {
      let data = n.dataValues;
      data.thumbs_up = n.Votes.length;
      return data;
    });

    resCb.send(cloection);
  }).catch(function(err) {
    errCb(webFaultHelper.getFault(err));
  });

}
