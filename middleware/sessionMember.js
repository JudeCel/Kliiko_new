'use strict';

var _ = require('lodash');
var models = require('./../models');
var SessionMember = models.SessionMember;
var AccountUser = models.AccountUser;
var accessDeniedMessage = 'Access Denied!!'

function checkRoles(roles, allowedRoles) {
  let result = _.intersection(allowedRoles, roles);
  return(result.length > 0)
}

// Checks access for accountuser roles, if doesn't have, checks for session member
function hasAccess(memberRoles, accountRoles) {
  return function(req, res, next) {
    if (!res.locals.currentDomain) { throw new Error('currentDomain is not defined in the response locals') }
    let roles = res.locals.currentDomain.roles;

    if(checkRoles(roles, accountRoles || [])) {
      next();
    }
    else {
      let sessionId;
      if(req.params.id) {
        sessionId = req.params.id;
      }
      else {
        sessionId = { $ne: null };
      }

      SessionMember.find({
        include: [{
          model: AccountUser,
          where: { UserId: req.user.id, AccountId: res.locals.currentDomain.id }
        }],
        where: {
          role: { $in: memberRoles },
          sessionId: sessionId
        },
        attributes: ['id']
      }).then(function(result) {
        if(result) {
          next();
        }
        else {
          res.status(403).send(accessDeniedMessage);
        }
      });
    }
  }
}

module.exports = {
  hasAccess: hasAccess,
  accessDeniedMessage: accessDeniedMessage
}
