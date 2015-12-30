/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

"use strict";

var User = require('./../../models').User;

module.exports = {
  userGet: userGet,
  userPost: userPost,
  userCanAccessPost:userCanAccessPost
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
    result.update(req.body);
    res.send(req.body);
  }).catch(function (err) {
    res.send({error:err});
  });
}

function userGet(req, res, next) {
  User.find({
    where: {
      id: req.user.id
    },
    attributes: userDetailsFields
  }).then(function (result) {
    res.send(result);
  }).catch(function (err) {
    res.send({error: err});
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

