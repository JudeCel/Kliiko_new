var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('config');
var models  = require('./../models');
var usersRepo = require('./../repositories/users.js');
var socialProfileRepo = require('./../repositories/socialProfile.js');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function(username, password, done) {
    usersRepo.comparePassword(username, password, function(failed, result) {
      if (failed) {
        return done(null, false);
      }else{
        return done(null, result);
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
    findOrCreateUser(profile, done);
  }
));

passport.use(new GoogleStrategy({
    clientID: config.get("googleClientID"),
    clientSecret: config.get("googleClientSecret"),
    callbackURL: config.get("googleCallbackURL")
  },
  function(token, refreshToken, profile, done) {

    process.nextTick(function() {
      findOrCreateUser(profile, done);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, {id: user.id, email: user.email, accountName: user.accountName});
});

passport.deserializeUser(function(userObject, done) {

  models.User.find({attributes: ['email', 'accountName', 'id'], where: {id: userObject.id}}).done(function(result){
    if (result) {
      done(null, {id: result.id, email: result.email, accountName: result.accountName});
    }else{
      done("not found", null);
    };
  });
});

function findOrCreateUser(profile, done){
  socialProfileRepo.findOrCreateUser(profile, function(error, result) {
    if (error) {
      done(error);
    }else{
      models.SocialProfile.find({where: {id: result.id }, include: [ models.User ]}).done(function(sp) {
        return done(null, sp.User);
      });
    }
  });
}

module.exports = passport;
