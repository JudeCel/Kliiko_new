/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

"use strict";

let User = require('./../../models').User;
let changePasswordService = require('../../services/changePassword');
let _ = require('lodash');
let chargebeeModule = require('./../../modules/chargebee/chargebeeModule');
let q = require('q');
let policy = require('./../../middleware/policy.js')

module.exports = {
  userGet: userGet,
  userPost: userPost,
  userCanAccessPost:userCanAccessPost,
  changePassword:changePassword
};

function userPost(req, res, next) {
  User.find({
    where: {
      id: req.user.id
    }
  }).then(function (result) {
    result.update(req.body);
    res.send(req.body);
  }).catch(function (err) {
    res.send({error:err});
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
    getUserSubscriptionsData()
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

  function getUserSubscriptionsData() {
    return chargebeeModule.getSubscriptions(reqUser.id);
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
      res.send({error: `Access Denied for ${roles[0]}`});
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
