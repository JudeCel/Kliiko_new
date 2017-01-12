'use strict';

var _ = require('lodash');
var MessagesUtil = require('./../util/messages');

module.exports = {
  hasAccess: checkRoles,
  accessDeniedMessage: MessagesUtil.middleware.policy.noAccess,
  authorized: authorized
};

function checkRoles(role, allowedRoles) {
  return _.includes(allowedRoles, role);
}

function authorized(allowedRoles) {
  return function(req, res, next) {
    if(!req.currentResources) { throw new Error('currentResources is not defined in the req'); }
    if(checkRoles(req.currentResources.accountUser.role, allowedRoles)) {
      next();
    }
    else {
      return res.status(404).send(MessagesUtil.middleware.policy.noAccess);
    }
  }
}
