'use strict';
var models  = require('./../models');
var User  = models.User;
var accessDeniedMessage = 'Access Denied!!'

function hasAccess(req, res, next) {
  User.find({where: {id: req.user.id}, attributes: ['id'],
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
