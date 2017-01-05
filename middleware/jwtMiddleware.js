'use strict';
const jwtAuth = require('../lib/jwt');
const expressJwt = require('express-jwt');

const loadResources = (req, res, next) => {
  jwtAuth.loadResources(req.auth).then((currentResources) => {
    req.currentResources = currentResources
    next();
  }, (error) => {
    next();
  });
}

const jwt = (req, res, next) => {
  expressJwt(
    {secret: process.env.JWT_SECRET_KEY, requestProperty: 'auth'}
  )(req, res, next);
}

module.exports = {
  jwt: jwt,
  loadResources: loadResources
}
