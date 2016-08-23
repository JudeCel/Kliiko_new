'use strict';

var MessagesUtil = require('./../../util/messages');
var sessionMemberService = require('./../../services/sessionMember');

module.exports = {
  addFacilitator: addFacilitator
};

function addFacilitator(req, res, next) {
  let params = req.body;

  sessionMemberService.removeByRole('facilitator', params.sessionId, res.locals.currentDomain.id).then(function() {
    sessionMemberService.createWithTokenAndColour(params).then(function(member) {
      res.send({ facilitator: member, message: MessagesUtil.routes.sessionMember.addFacilitator });
    }, function (err) {
      res.send({error:err});
    });
  }, function (err) {
    res.send({error: err});
  });
}
