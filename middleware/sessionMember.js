'use strict';

var models = require('./../models');
var SessionMember = models.SessionMember;
var AccountUser = models.AccountUser;
var accessDeniedMessage = 'Access Denied!!'

function hasAccess(roles) {
  return function(req, res, next) {
    SessionMember.find({
      include: [{
        model: AccountUser,
        where: { UserId: req.user.id, AccountId: res.locals.currentDomain.id }
      }],
      where: {
        role: { $in: roles },
        sessionId: req.params.id
      },
      attributes: ['id']
    }).then(function(result) {
      if(result) {
        next();
      }
      else {
        res.status(404).send(accessDeniedMessage);
      }
    });
  }
};

module.exports = {
  hasAccess: hasAccess,
  accessDeniedMessage: accessDeniedMessage
}
