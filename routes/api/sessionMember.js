'use strict';

let sessionMemberService = require('./../../services/sessionMember');

module.exports = {
  addMember: addMember
};

function addMember(req, res, next) {
  var params = req.body;

  if (params.role == 'facilitator') {

    sessionMemberService.removeByRole(params.role, params.sessionId, res.locals.currentDomain.id).then(
      function (res) {
        createBulk();
      },
      function (err) {
      }
    );


  } else {
    createBulk();
  }

  function createBulk() {
    sessionMemberService.bulkCreate([params], params.sessionId).then(
      function (resp) {
        res.send(resp);
      },
      function (err) {
        res.send({error:err});
      }
    );
  }


}