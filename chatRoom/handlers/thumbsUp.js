"use strict";
var _ = require('lodash');
// var ifData = require('if-data'), db = ifData.db;
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');
// var getEvent = ifData.repositories.getEvent;
// var getUserVotes = ifData.repositories.getUserVotes;
// var getVotes = ifData.repositories.getVotes;
// var createVote = ifData.repositories.createVote;
// var updateVote = ifData.repositories.updateVote;
// var createUserVotes =  ifData.repositories.createUserVotes;
var models = require("./../../models");
var Event = models.Event;
var Vote = models.Vote;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        eventId: joi.number().required(),
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
      User.find({where: { id: req.params.updating_userId } }).then(function(user) {
        user.addVote(vote, {
          topicId: req.params.topicId,
          eventId: req.params.eventId,
        }).then(function(_result) {
          result.increment('number').then(function(vote) {
            res.send(vote.defaultValue);
          });
        }).catch(function(err) {
          mainCb(webFaultHelper.getFault(err));
        });
      });
    }
  ).catch(function(err) {
    mainCb(webFaultHelper.getFault(err));
  });




  // var topicId = 0;
  //
  //       getEvent(req.params.eventId)
  //           .then(function (event) {
	// 		if (!event) return;
	// 		topicId = event.topicId;
	// 		getUserVotes(req.params.updating_userId, event.topicId, req.params.eventId)
	// 			.then(function (userVotes) {
	// 				if (userVotes && userVotes.length > 0) return "no votes";
  //                       return getVotes(req.params.eventId);
	// 			})
	// 			.then (function (votes) {
	// 				if (!votes || votes.length == 0) {
	// 					return createVote({
	// 						eventId: req.params.eventId,
	// 						count: 1
	// 					})
	// 				}
  //                   else if (votes=="no votes")
  //                       return;
	// 				else {
	// 					return updateVote({
	// 						id: votes.id,
	// 						count: votes.count + 1
	// 					});
	// 				}
	// 			})
	// 			.done( function()
  //               {
  //                   var tmp= getVotes(req.params.eventId);
  //                   tmp.then (function (votes) {
  //                       if (votes) {
  //                           createUserVotes({
  //                               vote_id: votes.id,
  //                               userId: req.params.updating_userId,
  //                               topicId: topicId,
  //                               eventId: req.params.eventId
  //                           })
  //                           return votes.count;
  //                       }
  //                       return 0;
  //                   }).done(function (votesCount) {
  //                       res.send(votesCount);
	// 			    }, mainCb);
  //               });
	// 	})
		/*.done(function (votesCount) {
			res.send(); //serves no purpose whatsoever!
		}, mainCb);*/
};
