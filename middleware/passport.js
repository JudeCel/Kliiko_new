"use strict";
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('config');
var models  = require('./../models');
var usersService = require('./../services/users.js');
var socialProfileService = require('./../services/socialProfile.js');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function (username, password, done) {
    usersService.comparePassword(username, password, function(failed, result) {
      if (failed) {
        done('Sorry, your Email and Password do not match. Please try again.');
      }else{
        prepareUserData(result, null, done);
      }
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: config.get("facebookclientID") ,
    clientSecret: config.get("facebookClientSecret") ,
    callbackURL: config.get("facebookCallbackURL"),
    passReqToCallback : true,
    profileFields: ['id', 'displayName','emails', 'name']
  },
  function(req, accessToken, refreshToken, profile, done) {
    socialProfileService.findByConfirmedUser(profile.provider, profile.id, function(err, result) {
      if (result) {
        prepareUserData(result.User, profile, done);
      }else{
        done(err, null, profile);
      }
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: config.get("googleClientID"),
    clientSecret: config.get("googleClientSecret"),
    callbackURL: config.get("googleCallbackURL")
  },
  function(token, refreshToken, profile, done) {

    process.nextTick(function() {
      socialProfileService.findByConfirmedUser(profile.provider, profile.id, function(err, result) {
        if (result) {
          prepareUserData(result.User, profile, done);
        }else{
          done(err, null, profile);
        }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(userObject, done) {
  models.User.find({ attributes: ['email', 'id', 'signInCount'], where: { id: userObject.id } }).done(function(result){
    if (result) {
      done(null, userParams(result));
    }else{
      done("not found", null);
    };
  });
});

function userParams(user, ownerAccount) {
  return {
    id: user.id,
    email: user.email,
    signInCount: user.signInCount
  };
}

function prepareUserData(user, profile, callback){
  if (!user.confirmedAt) {
    callback('Your account has not been confirmed, please check your e-mail and follow the link.');
    return;
  }

  user.getAccounts({ include: [ models.AccountUser ] }).then(function(accounts) {
    let account = accounts[0];
    if(account.AccountUser.active) {
      user.increment('signInCount').done(function(result) {
        callback(null, userParams(result));
      });
    }
    else {
      callback('Sorry, your account has been deactivated. Please get in touch with the administration');
    }
  });
}

module.exports = passport;
