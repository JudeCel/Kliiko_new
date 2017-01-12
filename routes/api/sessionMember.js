'use strict';

var MessagesUtil = require('./../../util/messages');
var sessionMemberService = require('./../../services/sessionMember');
var inviteService = require('./../../services/invite');
var sessionBuilderService = require('./../../services/sessionBuilder');
var sessionBuilderSnapshotValidationService = require('./../../services/sessionBuilderSnapshotValidation');

module.exports = {
  addFacilitator: addFacilitator,
  getSessionMembers: getSessionMembers
};

function addFacilitator(req, res, next) {
  let params = req.body;

  sessionBuilderSnapshotValidationService.isFacilitatorDataValid(params.snapshot, params.accountUserId, params.sessionId, sessionBuilderService).then(function(validationRes) {

    if (validationRes.isValid) {
      sessionMemberService.removeByRole('facilitator', params.sessionId, req.currentResources.account.id).then(function() {
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
    } else {
      res.send({ validation: validationRes });
    }

  }, function (err) {
    res.send({error: err});
  });

}

function getSessionMembers(req, res, next) {
  let params = req.body;
  sessionMemberService.getSessionMembers(params.sessionId, params.acountUserIds).then(function(members) {
    res.send({members: members});
  }, function (err) {
    res.send({error:err});
  });
}
