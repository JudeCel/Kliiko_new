'use strict';

var jwt = require('./../../lib/jwt');
var request = require('request');
var sessionMeberService = require('./../../services/sessionMember');

function getChatRedirectUrl(req, res, {chatUrl, token}) {
  var options = {
    url: chatUrl + '/api/auth/token/',
    rejectUnauthorized: false,
    headers: {
      'Authorization': token
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
  sessionMeberService.findOrCreate(req.currentResources.user.id, req.query.sessionId).then((sessionMmeber) => {
    let token = jwt.token(sessionMmeber.id, 'SessionMember:', req.query.callback_url)
    getChatRedirectUrl(req, res, {token: token, chatUrl: req.query.chatUrl});
  }, (error) => {
    res.send({ error: error });
  })
}

module.exports = {
  jwtTokenForMember: jwtTokenForMember
};
