'use strict';
var models  = require('./../models');
var User  = models.User;
var accessDeniedMessage = 'Access Denied!!'

function hasAccess(req, res, next) {
  User.find({where: {id: req.user.id},
    include: [
      {model: models.SessionMember, where: {id: req.params.id}}
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
