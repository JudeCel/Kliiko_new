'use strict';

var MessagesUtil = require('./../../util/messages');
var sessionMemberService = require('./../../services/sessionMember');
var inviteService = require('./../../services/invite');

module.exports = {
  addFacilitator: addFacilitator,
  getSessionMembers: getSessionMembers
};

function addFacilitator(req, res, next) {
  let params = req.body;

  sessionMemberService.removeByRole('facilitator', params.sessionId, res.locals.currentDomain.id).then(function() {
    sessionMemberService.createWithTokenAndColour(params).then(function(member) {
      inviteService.createFacilitatorInvite(params).then(function() {
        res.send({ facilitator: member, message: MessagesUtil.routes.sessionMember.addFacilitator });
      }, function (err) {
        res.send({error:err});
      });
    }, function (err) {
      res.send({error:err});
    });
  }, function (err) {
    res.send({error: err});
  });
}

function getSessionMembers(req, res, next) {
  let params = req.body;
  sessionMemberService.getSessionMembers(params.sessionId, params.acountUserIds).then(function(res) {
    res.send(res);
  }, function (err) {
    res.send({error:err});
  });
}