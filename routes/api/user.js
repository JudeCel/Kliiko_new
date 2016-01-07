/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

"use strict";

var User = require('./../../models').User;
var changePasswordService = require('../../services/changePassword');
var _ = require('lodash');

module.exports = {
  userGet: userGet,
  userPost: userPost,
  userCanAccessPost:userCanAccessPost,
  changePassword:changePassword
};


var userDetailsFields = [
    'firstName',
    'lastName',
    'email',
    'gender',
    'mobile',
    'landlineNumber',
    'postalAddress',
    'city',
    'state',
    'postcode',
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
    result.update(req.body).then(function(updateResult) {
      res.send(req.body);
    }).catch(function(updateError) {
      res.send({error:updateError});
    });
  }).catch(function (err) {
    res.send({error:err});
  });
}

function userGet(req, res, next) {
  var role = res.locals.currentDomain.roles;

  User.find({
    where: {
      id: req.user.id,
    },
    attributes: userDetailsFields,
    raw: true,
  }).then(function (result) {
      result.role = role;
      res.send(result);
  }).catch(function (err) {
    res.send({error: err});
  });
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

