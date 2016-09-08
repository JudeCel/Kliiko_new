'use strict';

var jwt = require('./../../lib/jwt');

function getToken(req, res, next) {
  let token = jwt.token(res.locals.currentUser.accountUserId);
  res.send({ token: token });
};

function jwtTokenForMember(req, res, next) {
  jwt.tokenForMember(res.locals.currentUser.id, req.query.sessionId, req.query.callback_url).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  })
}

module.exports = {
  getToken: getToken,
  jwtTokenForMember: jwtTokenForMember
};
