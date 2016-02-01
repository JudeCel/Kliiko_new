'use strict';
var models  = require('./../models');
var AccountUser  = models.AccountUser;
var accessDeniedMessage = 'Access Denied!!'

function hasAccess(req, res, next) {
  AccountUser.find({where: {UserId: req.user.id, AccountId: res.locals.currentDomain.id}, attributes: ['id'],
    include: [
      {model: models.SessionMember, where: {sessionId: req.params.id}, attributes: []}
    ]}).done(function(result) {
      if (result) {
        next();
      }else {
        res.status(404).send(accessDeniedMessage);
      }
    });
};

module.exports = {
  hasAccess: hasAccess,
  accessDeniedMessage: accessDeniedMessage
}
