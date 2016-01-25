"use strict";
var _ = require('lodash');
var accessDeniedMessage = 'Access Denied!!!!'

function checkRoles(roles, allowedRoles) {
  let result = _.intersection(allowedRoles, roles);
  return(result.length > 0)
}

function authorized(allowedRoles) {
  return function(req, res, next) {
    if (!res.locals.currentDomain) { throw new Error('currentDomain is not defined in the response locals') }
    let roles = res.locals.currentDomain.roles;
    if (checkRoles(roles, allowedRoles)) {
      return next();
    } else {
      return res.status(404).send(accessDeniedMessage);
    }
  }
}

module.exports = {
  hasAccess: checkRoles,
  accessDeniedMessage: accessDeniedMessage,
  authorized: authorized
}
