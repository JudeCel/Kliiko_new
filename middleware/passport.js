"use strict";
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('config');
var models  = require('./../models');
var usersService = require('./../services/users.js');
var socialProfileRepo = require('./../services/socialProfile.js');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function (username, password, done) {
    usersService.comparePassword(username, password, function(failed, result) {
      if (failed) {
        done('Sorry, your Email and Password do not match. Please try again.');
      }else{
        if (!result.confirmedAt) {
            done('Your account has not been confirmed, please check your e-mail and follow the link.');
            return;
        }
        
        result.getAccounts({ include: [ models.AccountUser ] }).then(function(accounts) {
          let account = accounts[0];
          if(account.AccountUser.active) {
            result.increment('signInCount').done(function(result) {
              done(null, userParams(result, account));
            });
          }
          else {
            done('Sorry, your account has been deactivated. Please get in touch with the administration');
          }
        });
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
    socialProfileRepo.findOrCreateUser(profile, done);
  }
));

passport.use(new GoogleStrategy({
    clientID: config.get("googleClientID"),
    clientSecret: config.get("googleClientSecret"),
    callbackURL: config.get("googleCallbackURL")
  },
  function(token, refreshToken, profile, done) {

    process.nextTick(function() {
      socialProfileRepo.findOrCreateUser(profile, done);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(userObject, done) {
  models.User.find({attributes: ['email', 'id', 'firstName', 'signInCount'], where: {id: userObject.id}}).done(function(result){
    if (result) {
      result.getAccounts().then(function(accounts) {
        done(null, userParams(result, accounts[0]));
      });
    }else{
      done("not found", null);
    };
  });
});

function userParams(user, account) {
  return {
    id: user.id,
    email: user.email,
    subdomain: account.name,
    role: account.AccountUser.role,
    firstName: user.firstName,
    signInCount: user.signInCount,
    accountOwnerId: account.id
  };
}

module.exports = passport;
