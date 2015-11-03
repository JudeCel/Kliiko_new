"use strict";
var express = require('express');
var async = require('async');
var router = express.Router();
var users_repo = require('./../repositories/users.js');
var passport = require('passport');
var subdomains = require('../lib/subdomains.js');
var mail = require('../lib/mailer');
var config = require('config');

router.use(function (req, res, next) {

  if (req.path == '/logout') {
    return next();
  }

  if (req.user && (req.path.indexOf('dashboard') == -1) ) {
    res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
  }else{
    next();
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: ''});
});

router.get('/registration', function(req, res, next) {
  res.render('registration', users_repo.prepareParams(req));
});

router.post('/registration', function(req, res, next) {
  users_repo.create(users_repo.prepareParams(req), function(error, result) {
    if (error) {
      res.render('registration', users_repo.prepareParams(req, error));
    }else{
      users_repo.comparePassword(result.email, result.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect("/dashboard")
          });
        };
      });
    };
  });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
  }
);

router.get('/login', function(req, res, next) {
  res.render('login', { user: req.user, title: 'Login', error: ""});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    subdomains.url(req, req.user.accountName, '/dashboard')
    res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect(subdomains.url(req, 'insider', '/'));
});

router.route('/forgotpassword')
  .get( function(req, res, next) {
    res.render('forgotpassword', { title: 'Forgot your password?', email: '', error: '', success: ''});
  })
  .post( function(req, res, next) {

    var error = '';
    var success = '';
    var title = 'Forgot your password?';
    var email = req.body.email;

    if (email) {

      async.waterfall([
        function(next) {
          users_repo.setResetToken(email, next);
        },
        function(token, next) {
          if(!token) return next();

          var params = {
            to: email,
            subject: 'Insider Focus - Reset password'
          };
          var message = "A request was made to change your password for.  Click link to reset: ";
              message += "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/resetpassword/"+token;

          mail(message, params, next);
        }
      ], function(err ) {
        if (err) {
          error = 'Failed to send data. Please try later';
        }else {
          success = 'Account recovery email sent to ' + email;
        }

        res.render('forgotpassword', { title: title, email: email, error: error, success: success});
      });

    }else{
      error = 'Please fill e-mail fields';
      res.render('forgotpassword', { title: title, email: email, error: error, success: success});
    }

  });

router.route('/resetpassword/:token')
  .get(function(req, res, next) {
    /*
    users_repo.getUserByToken(req.params.token, function(err, user){
      if (err) return  next();
      if (user) {

      }
    });
    */
    res.render('resetpassword', { title: 'Reset password', errors: {}});
  }).post( function(req, res, next) {
    res.render('resetpassword', { title: 'Reset  password', errors: {}});
  });

module.exports = router;
