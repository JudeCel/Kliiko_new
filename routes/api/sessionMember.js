'use strict';

let sessionMemberService = require('./../../services/sessionMember');

module.exports = {
  addMembers: addMembers
};

function addMembers(req, res, next) {
  var params = req.body;

  if (params.role == 'facilitator') {

    sessionMemberService.removeByRole(params.role, params.sessionId, res.locals.currentDomain.id).then(
      function (resp) {
        createBulk();
      },
      function (err) {
        res.send({error: err});
      }
    );


  } else {
    createBulk();
  }

  function createBulk() {
    for (var i = 0, len = params.members.length; i < len ; i++) {
      params.members[i].sessionId = params.sessionId;
      params.members[i].role = params.role
    }
    sessionMemberService.bulkCreate(params.members, params.sessionId).then(
      function (resp) {
        res.send(resp);
      },
      function (err) {
        res.send({error:err});
      }
    );
  }


}