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

function checkRoles(role, allowedRoles) {
  return _.includes(allowedRoles, role);
}

// Checks access for accountuser roles, if doesn't have, checks for session member
function hasAccess(memberRoles, accountRoles) {
  return function(req, res, next) {
    if (!req.currentResources) { throw new Error('currentResources is not defined in the req') }
    if(checkRoles(req.currentResources.accountUser.role, accountRoles || [])) {
      next();
    }else {
      checkMemberRoles(memberRoles, req, res, next);
    }
  }
}

function checkMemberRoles(memberRoles, req, res, next) {
  let sessionId = req.params.id ? req.params.id : { $ne: null };

  SessionMember.find({
    where: { role: { $in: memberRoles }, sessionId: sessionId },
    include: [{
      model: AccountUser,
      where: { UserId: req.currentResources.user.id, AccountId: req.currentResources.account.id }
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
