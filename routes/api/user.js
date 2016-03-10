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
  let currentDomain = res.locals.currentDomain
  let roles = currentDomain.roles;
  let reqUser = req.user;

  q.all([
    getUserBasicData(),
  ]).then(function(response) {
    let user = response[0];
    user.subscriptions = response[1][0];
    res.send(user);
  });

  function getUserBasicData() {
    let deferred = q.defer();
    reqUser.roles = roles;



    deferred.resolve(reqUser);
    return deferred.promise;
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
  var section = req.body.section;

  if (section === 'bannerMessages') {handleBannerMessages(); return}

  handleDefault();


  function handleBannerMessages() {
    if (policy.authorized(roles)) {
      res.send({accessPermitted: true, role: roles})
    } else {
      res.send({error: `Access Denied for ${roles}`});
    }
  }

  function handleDefault() {
    if (policy.authorized(roles)) {
      next();
    }else {
      res.send({error: 'Access Denied'});
    }
  }
}
