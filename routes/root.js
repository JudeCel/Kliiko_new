"use strict";
var express = require('express');
var async = require('async');
var router = express.Router();
var usersRepo = require('./../services/users');
var resetPassword = require('./../services/resetPassword');
var emailConfirmation = require('./../services/emailConfirmation');
var passport = require('passport');
var subdomains = require('../lib/subdomains');
var config = require('config');
var mailers = require('../mailers');
var session = require('../middleware/session');

router.use(function (req, res, next) {
    if (req.path == '/logout') {
        return next();
    }
    if (req.user && (req.path.indexOf('dashboard') == -1)) {
        res.redirect(subdomains.url(req, req.user.subdomain, '/dashboard'));
    } else {
        next();
    }
});

/* GET root page. */
router.get('/', function (req, res, next) {
    res.render('login', {title: 'Login', error: ""});
});

router.get('/registration', function (req, res, next) {
    res.render('registration', usersRepo.prepareParams(req));
});
router.get('/landing', function(req, res, next) {
  res.render('landing', { title: 'landing' });
});

router.post('/registration', function (req, res, next) {
  usersRepo.create(usersRepo.prepareParams(req), function (error, result) {
    if (error) {
        res.render('registration', usersRepo.prepareParams(req, error));
    } else {
      let tplData = {
        title: 'Email Confirmation',
        error: '',
        success: '',
        email: ''
      };

      let email = req.body.email;
      emailConfirmation.sendEmailConfirmationToken(email, function (err) {
        if (err) {
          tplData.error = 'Failed to send data. Please try later';
        } else {
          tplData.success = 'Email confirmation sent to ' + email;
        }
      });
      res.render('login', {title: 'Login', error: "Please, Confirm Your Email"});
    };
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return  res.render('login', {title: 'Login', error: "Wrong email or password or email is not confirmed"})
    }
    req.login(user, function(err) {
      if (err) { return next(err); }
      session.rememberMe(req, function(err, result) {
        if (err) { throw err}
        if (result) {
          return res.redirect(subdomains.url(req, req.user.subdomain, '/dashboard'));
        }
      });
    });
  })(req, res, next);
});


router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login', error: ""});
});


// Disable by customer
// router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', {failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect(subdomains.url(req, req.user.subdomain, '/dashboard'));
//   }
// );
//
// router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
// router.get('/auth/google/callback',
//   passport.authenticate('google', {failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect(subdomains.url(req, req.user.subdomain, '/dashboard'));
//   }
// );
router.route('/emailConfirmation/:token')
  .get(function (req, res, next) {

    let tplData = {
      title: 'Email Confirmation',
      user: true,
      token: req.params.token,
      errors: {}
    };

    emailConfirmation.checkTokenExpired(req.params.token, function (err, user) {
      if (err || !user) {
        tplData.user = false;
        tplData.errors.password = "Token expired";
        res.render('/login', tplData);
      }else{
        emailConfirmation.getEmailConfirmationByToken(user, function (err, user) {
          if (err) {
            tplData.errors.password = "Something is wrong with email confirmation";
            res.render('/login', tplData);
          }else{
            mailers.users.sendEmailConfirmationSuccess({email: user.email}, function (err, data) {
              res.redirect('/');
            });
          };
        });
      }
    });
  });

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect(subdomains.url(req, 'insider', '/'));
});

router.route('/forgotpassword')
    .get(function (req, res, next) {
        res.render('forgotPassword', {title: 'Forgot your password?', email: '', error: '', success: ''});
    })
    .post(function (req, res, next) {

        let tplData = {
            title: 'Forgot your password?',
            error: '',
            success: '',
            email: ''
        };
        let email = req.body.email;

        if (!email) {
            tplData.error = 'Please fill e-mail fields';
            res.render('forgotPassword', tplData);
            return;
        }

        let regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if (!regexp.test(email)) {
            tplData.error = 'Invalid e-mail format';
            res.render('forgotPassword', tplData);
            return;
        }

        resetPassword.sendToken(email, function (err) {
            if (err) {
                tplData.error = err.message;
            } else {
                tplData.success = 'Account recovery email sent to ' + email;
            }
            res.render('forgotPassword', tplData);
        });
    });

router.route('/resetpassword/:token')
    .get(function (req, res, next) {
        let tplData = {
            title: 'Reset password',
            user: true,
            token: req.params.token,
            errors: {}
        };

        resetPassword.checkTokenExpired(req.params.token, function (err, user) {
            if (err || !user) {
                tplData.user = false;
            }
            res.render('resetPassword', tplData);
        });

    }).post(function (req, res, next) {
        let tplData = {
            title: 'Reset password',
            user: true,
            token: req.params.token,
            errors: {}
        };

        if (!req.body.password || !req.body.repassword) {
            tplData.errors.password = "Please fill both passwords";
            res.render('resetPassword', tplData);
            return;
        }

        if (req.body.password !== req.body.repassword) {
            tplData.errors.password = "Passwords don't match";
            res.render('resetPassword', tplData);
            return;
        }

        resetPassword.resetByToken(req, function (err, user) {
            if (err) {
                tplData.errors.password = err.message;
                res.render('resetPassword', tplData);
                return;
            }
            mailers.users.sendResetPasswordSuccess({email: user.get('email')}, function (err, data) {
                res.redirect("/login");
            });
        });
    });

module.exports = router;
