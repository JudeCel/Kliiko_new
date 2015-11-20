"use strict";
var _ = require('lodash');
var accessDeniedMessage = 'Access Denied!!!!'

function checkRoles(roles, allowedRoles) {
  let result = _.intersection(allowedRoles, roles);
  return(result.length > 0)
}

function authorized(allowedRoles) {
  return function(req, res, next) {
    if (!req.currentDomain) { throw new Error('currentDomain is not defined in the request') }
    let roles = req.currentDomain.roles;

    if (checkRoles(roles, allowedRoles)) {
      return next();
    } else {
      return res.status(404).send(accessDeniedMessage);
    }
  }
}

module.exports = {
  accessDeniedMessage: accessDeniedMessage,
  authorized: authorized
}
