'use strict';

var _ = require('lodash');
var models = require('./../models');
var MessagesUtil = require('./../util/messages');
var SessionMember = models.SessionMember;
var AccountUser = models.AccountUser;

module.exports = {
  hasAccess: hasAccess,
  accessDeniedMessage: MessagesUtil.middleware.policy.noAccess
}

function checkRoles(roles, allowedRoles) {
  let result = _.intersection(allowedRoles, roles);
  return result.length;
}

// Checks access for accountuser roles, if doesn't have, checks for session member
function hasAccess(memberRoles, accountRoles) {
  return function(req, res, next) {
    if (!res.locals.currentDomain) { throw new Error('currentDomain is not defined in the response locals') }

    if(checkRoles(res.locals.currentDomain.roles, accountRoles || [])) {
      next();
    }
    else {
      checkMemberRoles(memberRoles, req, res, next);
    }
  }
}

function checkMemberRoles(memberRoles, req, res, next) {
  let sessionId = req.params.id ? req.params.id : null;

  SessionMember.find({
    where: { role: { $in: memberRoles }, sessionId: sessionId },
    include: [{
      model: AccountUser,
      where: { UserId: req.user.id, AccountId: res.locals.currentDomain.id }
    }],
    attributes: ['id']
  }).then(function(result) {
    if(result) {
      next();
    }
    else {
      res.status(403).send(MessagesUtil.middleware.policy.noAccess);
    }
  });
}
