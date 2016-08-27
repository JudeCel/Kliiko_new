'use strict';

var MessagesUtil = require('./../util/messages');
var models  = require('./../models');
var filters = require('./../models/filters');
var User = models.User;
var SocialProfile  = models.SocialProfile;

var _ = require('lodash');

module.exports = {
  create: create,
  find: find,
  findByConfirmedUser: findByConfirmedUser
}

function find(provider, id, callback) {
  SocialProfile.find({where: { provider: provider, providerUserId: id }, include: [ User ]})
    .then((result) => {
      callback(null, result);
    })
    .catch((error) => {
      callback(error);
    });
}

function findByConfirmedUser(provider, id, callback) {
  find(provider, id, function(err, result) {
    if (result) {
      if (result.User.confirmedAt) {
        callback(null, result);
      }else {
        callback({ message: MessagesUtil.socialProfile.verifyEmail }, null);
      }
    }else {
      callback(err, null);
    }
  })
}

function create(object, callback) {
  object.errors = object.errors || {};

  let socialProfileParams = {}
  socialProfileParams['providerUserId'] = object.params.socialProfile.id
  socialProfileParams['provider'] = object.params.socialProfile.provider
  socialProfileParams['userId'] = object.user.id

  SocialProfile.create(socialProfileParams, { transaction: object.transaction } ).then(function(result) {
    object.socialProfile = result;
    callback(null, object);
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
  });
}
