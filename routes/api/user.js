/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

"use strict";
let changePasswordService = require('../../services/changePassword');
let _ = require('lodash');
let q = require('q');
let policy = require('./../../middleware/policy.js')
let AccountUserService = require('../../services/accountUser');

module.exports = {
  userGet: userGet,
  userPost: userPost,
  userCanAccessPost:userCanAccessPost,
  changePassword:changePassword
};

function userPost(req, res, next) {
  AccountUserService.updateWithUserId(req.body, req.user.id, function(err) {
    if (err) {
      res.send({error:err});
    } else {
      res.send(req.body);
    }
  });
}

/**
 * Get All current user data, that can be required by app at the start
 */
function userGet(req, res, next) {
  if(req.user.accountUserId) {
    res.send(req.user);
  }
  else {
    AccountUserService.findWithUser(req.user).then(function(result) {
      res.send(result)
    }, function(error) {
      res.status(404).send(error);
    });
  }
}

function changePassword(req, res, next) {
  changePasswordService.save(req, function(errors, message, user){
    if (errors) {
      res.send({ error: errors.message, message: message });
    }else{
      res.send({ message: message });
    }
  });
}

function userCanAccessPost(req, res, next) {
  var roles = res.locals.currentDomain.roles;

  if (policy.authorized(roles)) {
    next();
  }else {
    res.send({error: 'Access Denied'});
  }
}
