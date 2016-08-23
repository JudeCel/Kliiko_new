/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

'use strict';
var changePasswordService = require('../../services/changePassword');
var _ = require('lodash');
var q = require('q');
var policy = require('./../../middleware/policy.js')
var AccountUserService = require('../../services/accountUser');
var MessagesUtil = require('./../../util/messages');

module.exports = {
  userGet: userGet,
  userPost: userPost,
  changePassword:changePassword
};

function userPost(req, res, next) {
  AccountUserService.updateWithUserId(req.body, req.user.id, function(err) {
    if (err) {
      res.send({error:err});
    } else {
      res.send({ user: req.body, message: MessagesUtil.routes.user.updateContactDetails });
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
