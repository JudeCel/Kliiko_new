'use strict';

var MessagesUtil = require('./../../util/messages');
var sessionMemberService = require('./../../services/sessionMember');
var inviteService = require('./../../services/invite');
var sessionBuilderService = require('./../../services/sessionBuilder');

module.exports = {
  addFacilitator: addFacilitator
};

function addFacilitator(req, res, next) {
  let params = req.body;

  sessionBuilderService.isFacilitatorDataValid(params.snapshot, params.accountUserId, params.sessionId).then(function(validationRes) {

    if (validationRes.isValid) {
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
    } else {
      res.send({ validation: validationRes });
    }

  }, function (err) {
    res.send({error: err});
  });
  
}
