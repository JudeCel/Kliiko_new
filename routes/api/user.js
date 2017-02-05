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
  AccountUserService.updateWithUserId(req.body, req.currentResources.user.id, function(err) {
    if (err) {
      res.send({error:err});
    } else {
      var message = Object.keys(req.body).length == 1 && req.body.emailNotification ? MessagesUtil.routes.user.updateEmailNotifications : MessagesUtil.routes.user.updateContactDetails;
      res.send({ user: req.body, message: message });
    }
  });
}

/**
 * Get All current user data, that can be required by app at the start
 */
function userGet(req, res, next) {
  res.send(req.currentResources);
}

function changePassword(req, res, next) {
  changePasswordService.save(req, function(errors, message, user){
    if (errors) {
      res.send({ error: errors.message, message: message });
    } else {
      res.send({ message: message });
    }
  });
}
