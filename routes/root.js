"use strict";
var express = require('express');
var async = require('async');
var router = express.Router();
var usersRepo = require('./../repositories/users');
var resetPassword = require('./../repositories/resetPassword');
var passport = require('passport');
var subdomains = require('../lib/subdomains');
var config = require('config');
var mailers = require('../mailers');
var session = require('../middleware/session')

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

/* GET root page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', error: ""});
});

router.get('/registration', function(req, res, next) {
  res.render('registration', usersRepo.prepareParams(req));
});
router.get('/landing', function(req, res, next) {
  res.render('landing', { title: 'landing', user: req.user });
});
router.post('/registration', function(req, res, next) {
  usersRepo.create(usersRepo.prepareParams(req), function(error, result) {
    if (error) {
      res.render('registration', usersRepo.prepareParams(req, error));
    }else{
      usersRepo.comparePassword(result.email, result.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect(subdomains.url(req, result.accountName, '/dashboard'))
          });
        };
      });
    };
  });
});

router.post('/login', function(req, res, next) {
  let post = req.body;
  usersRepo.comparePassword(post.email, post.password, function(failed, result) {
    if (failed) {
      res.render('login', { title: 'Login', error: "Wrong email or password"})
    }else{
      req.login(result, function(err) {
        res.redirect(subdomains.url(req, result.accountName, '/dashboard'))
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
  res.render('login', { title: 'Login', error: ""});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res, next) {
    session.rememberMe(req, function(err, result) {
      if (err) { throw err}
      if (result) {
        res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
      }
    })
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect(subdomains.url(req, 'insider', '/'));
});

router.route('/forgotpassword')
  .get( function(req, res, next) {
    res.render('forgotPassword', { title: 'Forgot your password?', email: '', error: '', success: ''});
  })
  .post( function(req, res, next) {

    let tplData = {
      title: 'Forgot your password?',
      error: '',
      success: '',
      email: ''
    };
    let email = req.body.email;

    if(!req.body.email) {
      tplData.error = 'Please fill e-mail fields';
      res.render('forgotPassword', tplData);
      return;
    }

    resetPassword.sendToken(email, function(err){
      if (err) {
        tplData.error = 'Failed to send data. Please try later';
      }else {
        tplData.success = 'Account recovery email sent to ' + email;
      }
      res.render('forgotPassword', tplData);
    });
  });

router.route('/resetpassword/:token')
  .get(function(req, res, next) {
    let tplData = {
      title: 'Reset password',
      user: true,
      token: req.params.token,
      errors: {}
    };

    resetPassword.checkTokenExpired(req.params.token, function(err, user){
      if (err || !user) {
        tplData.user = false;
      }
      res.render('resetPassword', tplData);
    });

  }).post( function(req, res, next) {
    let tplData = {
      title: 'Reset password',
      user: true,
      token: req.params.token,
      errors: {}
    };

    if ( !req.body.password || !req.body.repassword ) {
      tplData.errors.password = "Please fill both passwords";
      res.render('resetPassword', tplData);
      return;
    }

    if ( req.body.password !== req.body.repassword ) {
      tplData.errors.password = "Passwords not equal";
      res.render('resetPassword', tplData);
      return;
    }

    resetPassword.resetByToken(req, function(err, user){
      if (err) {
        tplData.errors.password = "Reset password failed";
        res.render('resetPassword', tplData);
        return;
      }
      mailers.users.sendResetPasswordSuccess({email: user.get('email')}, function(err, data){
        res.redirect("/login");
      });
    });
  });

module.exports = router;
