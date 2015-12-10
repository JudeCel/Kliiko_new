"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var joi = require('joi');
var _ = require('lodash');
var models = require("./../../models");
var Event = models.Event;


module.exports.validate = function (req, next) {
  var err = joi.validate(req.params, {
    topicId: joi.number().required()
  });

  if (err.error){
    return next(webFaultHelper.getValidationFault(err.error));
  }

  next();
};

module.exports.run = function (req, resCb, errCb) {
  let topicId = req.params.topicId;

  Event.findAll({ where: {topicId: topicId, cmd: 'chat'},
    include: [models.Vote],
    order: [['createdAt', 'ASC']] })
  .then(function(result) {
    let collection  = _.map(result, function(n) {
      let data = n.dataValues;
      data.thumbs_up = _.sum(n.Votes, function(vote) { return vote.count });
      return data;
    });

    resCb.send(collection);
  }).catch(function(err) {
    errCb(err);
  });

}
