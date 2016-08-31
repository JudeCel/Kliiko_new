'use strict';

var _ = require('lodash');
var MessagesUtil = require('./../util/messages');

module.exports = {
  hasAccess: checkRoles,
  accessDeniedMessage: MessagesUtil.middleware.policy.noAccess,
  authorized: authorized
};

function checkRoles(roles, allowedRoles) {
  let result = _.intersection(allowedRoles, roles);
  return result.length;
}

function authorized(allowedRoles) {
  return function(req, res, next) {
    if(!res.locals.currentDomain) { throw new Error('currentDomain is not defined in the response locals'); }
    if(checkRoles(res.locals.currentDomain.roles, allowedRoles)) {
      next();
    }
    else {
      return res.status(404).send(MessagesUtil.middleware.policy.noAccess);
    }
  }
}
