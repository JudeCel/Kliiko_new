"use strict";
var models  = require('./../models');
var User = models.User;
var SocialProfile  = require('./../models').SocialProfile;
var async = require('async');
var _ = require('lodash');


function validate(params, callback) {
  let provider = params.socialProfile.provider;
  let id = params.socialProfile.id;

  find(provider, id, (err, result) => {
    if (err) { throw err };
    if (result) {
      callback("Profile already exists!")
    }else{
      callback(null, params)
    }
 });
}

function find(provider, id, callback) {
  SocialProfile.find({where: { provider: provider, providerUserId: id }, include: [ models.User ]})
    .then((result) => {
      callback(null, result);
    })
    .catch((error) => {
      callback(error);
    });
}

function create(user, params, callback) {
  let socialProfileParams = {}
  socialProfileParams['providerUserId'] = params.socialProfile.id
  socialProfileParams['provider'] = params.socialProfile.provider
  socialProfileParams['userId'] = user.id

  SocialProfile.create(socialProfileParams).then(function(result) {
    callback(null, user, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    callback(err, null);
  }).catch(function(err) {
    callback(err, null);
  });
}

module.exports = {
  validate: validate,
  create: create,
  find: find
}
