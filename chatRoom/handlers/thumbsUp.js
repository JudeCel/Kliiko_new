"use strict";
var _ = require('lodash');
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var models = require("./../../models");
var Event = models.Event;
var Vote = models.Vote;
var User = models.User;


module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        eventId: joi.number().required(),
        topicId: joi.number().required(),
        updating_userId: joi.number().required()
    });

    if (err.error) {
      return next(webFaultHelper.getValidationFault(err.error))
    };

    next();
};

module.exports.run = function (req, res, mainCb) {
  Vote.findOrCreate({where: {eventId: req.params.eventId}})
    .spread(function(vote, created) {
      User.find({where: { id: req.params.updating_userId }}).done(function(user) {
        user.getVotes({where: {id: vote.id }}).done(function(votes) {
          if (_.isEmpty(votes)) {
            user.addVote(vote, {
              TopicId: req.params.topicId,
              EventId: req.params.eventId,
            }).done(function(_result) {
              vote.increment('count').done(function(result) {
                res.send(result.count);
              });
            });
          }else{
            user.removeVote(vote).done(function(_result) {
              vote.decrement('count').done(function(result) {
                res.send(result.count);
              });
            });
          }
        })
      });
    }
  ).catch(function(err) {
    mainCb(webFaultHelper.getFault(err));
  });
};
