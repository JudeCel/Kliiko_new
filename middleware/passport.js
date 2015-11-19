"use strict";
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('config');
var models  = require('./../models');
var usersRepo = require('./../services/users.js');
var socialProfileRepo = require('./../services/socialProfile.js');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function(username, password, done) {
    usersRepo.comparePassword(username, password, function(failed, result) {
      if (failed) {
        done("Wrong email or password");
      }else{
        result.getOwnerAccount().then(function(accounts) {
          let accaount = accounts[0]
          done(null, {id: result.id, email: result.email, subdomain: accaount.name });
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
  models.User.find({attributes: ['email', 'id'], where: {id: userObject.id}}).done(function(result){
    if (result) {
      result.getOwnerAccount().then(function(result) {
        let accaount = result[0]
        done(null, {id: result.id, email: result.email, subdomain: accaount.name});
      });
    }else{
      done("not found", null);
    };
  });
});

module.exports = passport;
