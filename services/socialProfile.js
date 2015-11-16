"use strict";
var models  = require('./../models');
var User = models.User;
var SocialProfile  = require('./../models').SocialProfile;
var usersService  = require('./users');
var async = require('async');

var _ = require('lodash');
var bcrypt = require('bcrypt');

function findOrCreateUser(params, callback) {
  findSociaProfile(params.provider, params.id, function(error, profile) {
    if (error) { return callback(error, null) };

    if (profile) {
      callback(null, profile)
    } else {
      let creatNewUserFunctionList = [
        function(cb) {
          prepareUserAttrs(params, function(error, result) {
            cb(error, result, params)
          })
        },
        creatUser,
        createSocialProfile
      ]

      async.waterfall(creatNewUserFunctionList, function(error, result) {
        if (error) {
          return callback(error);
        }else{
          models.SocialProfile.find({where: {id: result.id }, include: [ models.User ]}).done(function(sp) {
            return callback(null, sp.User);
          });
        }
      });
    }
  })
}

function findSociaProfile(provider, id, callback) {
  SocialProfile.find({where: { provider: provider, providerUserId: id }, include: [ models.User ]})
    .done(function(result) {

      if (result) {
        return callback(null, result)
      };

      callback(null, null)
    });
}

function prepareUserAttrs(params, callback) {
  let userAttrs = {}
  bcrypt.genSalt(10, function(err, salt) {
    userAttrs.password = salt;

    User.findOne({order: [['createdAt', 'DESC']]}).done(function(result) {
      if (result) {
       userAttrs.accountName = "client" + (result.id + 1);
      }else{
        userAttrs.accountName = "client1";
      }

      mapSocialData(params, userAttrs, function(error, userAttrs){
        if (error){
          return callback(error);
        }else{
          return callback(null, userAttrs, params);
        }
      });

    })
  });
};

function mapSocialData(params, userAttrs, callback) {
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
      } else {
        userAttrs.requiredEmail = false;
      }
      break;
    default:
      error = new Error("Social profile provider not found " + params.provider);
  }
  return callback(error, userAttrs);
}

function createSocialProfile(user, params, callback) {
  let socialProfileParams = {}
  socialProfileParams['providerUserId'] = params.id
  socialProfileParams['provider'] = params.provider
  socialProfileParams['userId'] = user.id

  SocialProfile.create(socialProfileParams).then(function(result) {
    callback(null, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    callback(err, null);
  }).catch(function(err) {
    callback(err, null);
  });
}

function creatUser(attrs, params, callback) {
  usersService.createUser(attrs, function(error, user) {
    callback(error, user, params)
  })
}

module.exports = {
  findOrCreateUser: findOrCreateUser,
  socialProfile: SocialProfile
}
