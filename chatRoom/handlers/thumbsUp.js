"use strict";
var _ = require('lodash');
var ifData = require('if-data'), db = ifData.db;
var joi = require('joi');
var webFaultHelper = require('../helpers/webFaultHelper.js');
var getEvent = ifData.repositories.getEvent;
var getUserVotes = ifData.repositories.getUserVotes;
var getVotes = ifData.repositories.getVotes;
var createVote = ifData.repositories.createVote;
var updateVote = ifData.repositories.updateVote;
var createUserVotes =  ifData.repositories.createUserVotes;

module.exports.validate = function (req, next) {
    var err = joi.validate(req.params, {
        event_id: joi.types.Number().required(),
        updating_user_id: joi.types.Number().required()
    });

    if (err) return next(webFaultHelper.getValidationFault(err.message));

    next();
};

module.exports.run = function (req, res, mainCb) {
	var topicId = 0;

        getEvent(req.params.event_id)
            .then(function (event) {
			if (!event) return;
			topicId = event.topic_id;
			getUserVotes(req.params.updating_user_id, event.topic_id, req.params.event_id)
				.then(function (userVotes) {
					if (userVotes && userVotes.length > 0) return "no votes";
                        return getVotes(req.params.event_id);
				})
				.then (function (votes) {
					if (!votes || votes.length == 0) {
						return createVote({
							event_id: req.params.event_id,
							count: 1
						})
					}
                    else if (votes=="no votes")
                        return;
					else {
						return updateVote({
							id: votes.id,
							count: votes.count + 1
						});
					}
				})
				.done( function()
                {
                    var tmp= getVotes(req.params.event_id);
                    tmp.then (function (votes) {
                        if (votes) {
                            createUserVotes({
                                vote_id: votes.id,
                                user_id: req.params.updating_user_id,
                                topic_id: topicId,
                                event_id: req.params.event_id
                            })
                            return votes.count;
                        }
                        return 0;
                    }).done(function (votesCount) {
                        res.send(votesCount);
				    }, mainCb);
                });
		})
		/*.done(function (votesCount) {
			res.send(); //serves no purpose whatsoever!
		}, mainCb);*/
};