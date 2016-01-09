"use strict";
var models  = require('./../models');
var User = models.User;
var SocialProfile  = require('./../models').SocialProfile;
var async = require('async');
var _ = require('lodash');
var bcrypt = require('bcrypt');


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

function mapData(params, userAttrs, callback) {
  let error = null;
  switch(params.provider){
    case 'google':
      userAttrs.firstName = params.name.familyName;
      userAttrs.lastName = params.name.givenName;
      userAttrs.email = params.emails[0].value;
      break;
    case 'facebook':
      userAttrs.firstName = params._json.first_name;
      userAttrs.lastName = params._json.last_name;
      if (params._json.email) {
        userAttrs.email = params._json.email;
      }
      break;
    default:
      error = new Error("Social profile provider not found " + params.provider);
  }
  return callback(error, userAttrs);
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
  mapData: mapData
}
