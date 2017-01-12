'use strict';
const jwtAuth = require('../lib/jwt');
const expressJwt = require('express-jwt');

const loadResources = (req, res, next) => {
  jwtAuth.loadResources(req.auth).then((currentResources) => {
    res.header('refresh-token', jwtAuth.refresToken(req.auth, currentResources));
    req.currentResources = currentResources

    next();
  }, (error) => {
    next();
  });
}

const jwt = (req, res, next) => {
  expressJwt(
    {
      secret: process.env.JWT_SECRET_KEY, requestProperty: 'auth',
      getToken: (req) => {
        if (req.headers.authorization) {
            return req.headers.authorization;
        } else if (req.query && req.query.token) {
          return req.query.token;
        }
        return null;
      }
    }
  )(req, res, next);
}

module.exports = {
  jwt: jwt,
  loadResources: loadResources
}
