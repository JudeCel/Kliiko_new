"use strict";
var User  = require('./../models').User;
var SocialProfile  = require('./../models').SocialProfile;
var UsersRepo  = require('./users');

var _ = require('lodash');
var bcrypt = require('bcrypt');

function createFacebook(params, callback) {
  prepareUserAttrs(params, function(error, attrs) {
    creatUser(attrs, function(error, result) {
      console.log(result);
      callback(error, result)
    });
  });
}

function createGoogle(argument) {
  // body...
}


function prepareUserAttrs(params, callback) {
  let user_attrs = {}
  bcrypt.genSalt(10, function(err, salt) {
    user_attrs['password'] = salt
    user_attrs['displayName'] = params.displayName
    user_attrs['firstName'] = params._json.name.split(" ")[0];
    user_attrs['lastName'] = params._json.name.split(" ").pop();
    user_attrs['email'] = params._json.email
    callback(null, user_attrs)
  });
};



function creatUser(attrs, callback) {
  UsersRepo.createUser(attrs, callback)
}

module.exports = {
    createFacebook: createFacebook
}
