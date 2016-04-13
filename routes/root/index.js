"use strict";
var express = require('express');
var async = require('async');
var _ = require('lodash');
var router = express.Router();
var usersRepo = require('../../services/users');
var resetPassword = require('../../services/resetPassword');
var emailConfirmation = require('../../services/emailConfirmation');
var passport = require('passport');
var subdomains = require('../../lib/subdomains');
var mailers = require('../../mailers');
var session = require('../../middleware/session');
var middlewareFilters = require('../../middleware/filters');
var socialProfileMiddleware = require('../../middleware/socialProfile');
var inviteRoutes = require('./invite.js');
var surveyRoutes = require('./survey.js');
var myDashboardRoutes = require('./myDashboard.js');
var chargebeeRoutes = require('./chargebee.js');
var constants = require('../../util/constants');
var appData = require('../../services/webAppData');

router.use(function (req, res, next) {
  res.locals.appData = appData;
    if (req.path == '/logout') {
      return next();
    }

    let validPaths = ['invite', 'survey', 'my-dashboard', 'chargebee', 'api'];

    if(filterValidPaths(req.path, validPaths)){
      next();
    }else{
      let user = req.user;
      let account = res.locals.currentDomain;

      if(user && account){
        if(req.path.includes("/dashboard")){
          next();
        }else{
          res.redirect(subdomains.url(req, res.locals.currentDomain.name, '/dashboard'));
        }
      }else if(user && !account) {
        res.redirect(subdomains.url(req, process.env.SERVER_BASE_SUBDOMAIN, '/my-dashboard'));
      }else{
        if(filterRoutes(req.path)) {
          next();
        }else {
          res.redirect(subdomains.url(req, process.env.SERVER_BASE_SUBDOMAIN, '/login'));
        }
      }
    }
});

function filterRoutes(path) {
  let array = _.map(router.stack, function(layer) {
    if(layer.route && layer.route.path != '/'){
      return layer.route.path;
    }
  });
  return filterValidPaths(path, array);
}

function filterValidPaths(path, valid) {
  return !_.isEmpty(_.filter(valid, function(validPath) {
    return path.includes(validPath);
  }));
}

/* GET root page. */

router.get('/', function (req, res, next) {
    res.render('login', {title: 'Login', error: "", message: ''});
});

router.get('/registration', function (req, res, next) {
  res.render('registration', usersRepo.prepareParams(req));
});

router.get('/welcome', function (req, res, next) {
  res.render('welcome', usersRepo.prepareParams(req));
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

router.get('/auth/facebook/callback', function(req, res, next) {
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return res.render('login', { title: 'Login', error: err.message, message: "" });
    }
    if (user) {
      req.login(user, function(err) {
        middlewareFilters.myDashboardPage(req, res, next);
      })
    }else{
      res.locals = usersRepo.prepareParams(req);
      socialProfileMiddleware.assignProfileData(info, res.locals).then(function(resul) {
        res.render("registration", {appData: res.locals, error: {}});
      }, function(err) {
        next(err);
      })
    }
  })(req, res, next);
});

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', function(req, res, next) {
  passport.authenticate('google', function(err, user, info) {
    if (err) {
      return res.render('login', { title: 'Login', error: err.message, message: "" });
    }
    if (user) {
      req.login(user, function(err) {
        middlewareFilters.myDashboardPage(req, res, next);
      })
    }else{
      res.locals = usersRepo.prepareParams(req);
      socialProfileMiddleware.assignProfileData(info, res.locals).then(function(resul) {
        res.render("registration", { appData: res.locals, error: {} });
      }, function(err) {
        next(err)
      });
    }
  })(req, res, next);
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
      res.render('welcome',  {title: 'Please confirm Your Email', error: "Please confirm Your Email", message: '' , applicationName: process.env.MAIL_FROM_NAME});
    };
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return  res.render('login', {title: 'Login', error: err || info.message, message: ''});
    }
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      session.rememberMe(req, function(err, result) {
        if (err) { throw err}
        if (result) {
          middlewareFilters.myDashboardPage(req, res, next);
        }
      });
    });
  })(req, res, next);
});

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login', error: '', message: req.flash('message')[0] });
});

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
        tplData.message = '';
        res.render('/login', tplData);
      }else{
        emailConfirmation.getEmailConfirmationByToken(user, function (err, user) {
          if (err) {
            tplData.message = '';
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
    res.redirect(subdomains.url(req, subdomains.base, '/'));
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
            tplData.error = 'Please fill e-mail field';
            res.render('forgotPassword', tplData);
            return;
        }

        if (!constants.emailRegExp.test(email)) {
            tplData.error = 'Not a valid email address format. Please re-enter.';
            res.render('forgotPassword', tplData);
            return;
        }

        resetPassword.sendToken(email, function (err) {
            if (err) {
                tplData.error = err.message;
            } else {
                tplData.success = true;
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
                req.flash('message', 'Password was changed successfully');
                res.redirect("/login");
            });
        });
    });
router.route('/invite/:token').get(inviteRoutes.index);
router.route('/invite/:token/decline').get(inviteRoutes.decline);
router.route('/invite/:token/accept').get(inviteRoutes.acceptGet);
router.route('/invite/:token/accept').post(inviteRoutes.acceptPost);

router.route('/invite/:token/notThisTime').get(inviteRoutes.sessionNotThisTime);
router.route('/invite/:token/notAtAll').get(inviteRoutes.sessionNotAtAll);


router.route('/survey/:id').get(surveyRoutes.index);

router.route('/my-dashboard').get(myDashboardRoutes.index);

router.route('/chargebee/webhooks').post(chargebeeRoutes.endPoint);

module.exports = router;
