'use strict';

var jwt = require('./../../lib/jwt');

function getToken(req, res, next) {
  let response = jwt.token(res.locals.currentUser.accountUserId, req.query.redirectToChat);

  if(req.query.redirectToChat) {
    res.send({ url: response });
  }else{
    res.send({ token: response });
  }
};

module.exports = {
  getToken: getToken
};
