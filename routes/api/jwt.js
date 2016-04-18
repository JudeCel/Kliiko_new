'use strict';

var jwt = require('./../../lib/jwt');

function getToken(req, res, next) {
  let token = jwt.token(res.locals.currentDomain.id);
  res.send({ token: token });
};

module.exports = {
  getToken: getToken
};
