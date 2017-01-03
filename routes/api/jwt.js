'use strict';

var jwt = require('./../../lib/jwt');
var request = require('request');

function getToken(req, res, next) {
  let token = jwt.token(req.user.accountUserId);
  res.send({ token: token });
};

function getChatRedirectUrl(req, res, result) {
  var options = {
    url: req.query.chatUrl + '/api/auth/token/',
    rejectUnauthorized: false,
    headers: {
      'Authorization': result.token
    }
  };

  function callback(error, response, body) {
    if (error) {
      res.send({ error: error });
    } else {
      res.send(body);
    }
  }
  request(options, callback);
}

function jwtTokenForMember(req, res, next) {
  jwt.tokenForMember(res.locals.currentUser.id, req.query.sessionId, req.query.callback_url).then(function(result) {
    getChatRedirectUrl(req, res, result);
  }, function(error) {
    res.send({ error: error });
  });
}

module.exports = {
  getToken: getToken,
  jwtTokenForMember: jwtTokenForMember
};
