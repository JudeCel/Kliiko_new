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

module.exports = {
  userGet: userGet,
  userPost: userPost,
  userCanAccessPost:userCanAccessPost,
  changePassword:changePassword
};


var userDetailsFields = [
    'id',
    'firstName',
    'lastName',
    'email',
    'gender',
    'mobile',
    'landlineNumber',
    'postalAddress',
    'city',
    'state',
    'postCode',
    'country',
    'companyName',
    'tipsAndUpdate'
];

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
  let role = res.locals.currentDomain.roles;
  let userId = req.user.id;

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

    User.find({
      where: {
        id: userId
      },
      attributes: userDetailsFields,
      raw: true
    }).then(function(result) {
      result.role = role;
      deferred.resolve(result);
    }).catch(function (err) {
      deferred.reject({error: err});
    });
    return deferred.promise;
  }

  function getUserSubscriptionsData() {
    return chargebeeModule.getSubscriptions(userId);
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
  var role = req.user.role;
  var section = req.body.section;

  if (section === 'bannerMessages') {handleBannerMessages(); return}

  handleDefault();


  function handleBannerMessages() {
    if (role === 'user') {
      res.send({error: `Access Denied for ${role}`});
    } else {
      res.send({accessPermitted: true, role: role})
    }
  }

  function handleDefault() {
    res.send({error: 'Access Denied'});
  }
}
