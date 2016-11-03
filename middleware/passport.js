'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var models  = require('./../models');
var usersService = require('./../services/users.js');
var socialProfileService = require('./../services/socialProfile.js');
var MessagesUtil = require('./../util/messages');

module.exports = passport;
passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, localStrategyFunc));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  passReqToCallback : true,
  profileFields: ['id', 'displayName','emails', 'name']
}, facebookStrategyFunc));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, googleStrategyFunc));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(deserializeUser);

// Functions
function localStrategyFunc(username, password, done) {
  usersService.comparePassword(username, password, function(failed, result) {
    if (failed) {
      done(MessagesUtil.middleware.passport.userPasswordMatch);
    } else {
      prepareUserData(result, null, done);
    }
  });
}

function facebookStrategyFunc(req, accessToken, refreshToken, profile, done) {
  findByConfirmedUser(profile, done);
}

function googleStrategyFunc(token, refreshToken, profile, done) {
  process.nextTick(function() {
    findByConfirmedUser(profile, done);
  });
}

function deserializeUser(userObject, done) {
  models.User.find({ attributes: ['email', 'id', 'signInCount'], where: { id: userObject.id } }).done(function(result){
    if(result) {
      done(null, userParams(result));
    }
    else {
      done(MessagesUtil.middleware.passport.userNotFound, null);
    }
  });
}

// Helpers
function userParams(user, ownerAccount) {
  return {
    id: user.id,
    email: user.email,
    signInCount: user.signInCount
  };
}

function prepareUserData(user, profile, callback){
  if (!user.confirmedAt) {
    callback(MessagesUtil.middleware.passport.notConfirmed);
    return;
  }

  user.increment('signInCount').done(function(result) {
    callback(null, userParams(result));
  });
}

function findByConfirmedUser(profile, done) {
  socialProfileService.findByConfirmedUser(profile.provider, profile.id, function(err, result) {
    if(result) {
      prepareUserData(result.User, profile, done);
    }
    else {
      done(err, null, profile);
    }
  });
}
