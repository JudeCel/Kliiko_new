"use strict";
var express = require('express');
var async = require('async');
var _ = require('lodash');
var url = require('url');
var router = express.Router();
var usersRepo = require('../../services/users');
var resetPassword = require('../../services/resetPassword');
var emailConfirmation = require('../../services/emailConfirmation');
var passport = require('passport');
var subdomains = require('../../lib/subdomains');
var mailers = require('../../mailers');

var middlewareFilters = require('../../middleware/filters');
var socialProfileMiddleware = require('../../middleware/socialProfile');
var userRoutes = require('./user.js');
var inviteRoutes = require('./invite.js');
var surveyRoutes = require('./survey.js');
var myDashboardRoutes = require('./myDashboard.js');
var chargebeeRoutes = require('./chargebee.js');
var constants = require('../../util/constants');
var appData = require('../../services/webAppData');
var contactListUserRoutes = require('./contactListUser');

router.use(function (req, res, next) {
  res.locals.appData = appData;
    if (req.path == '/logout') {
      return next();
    }

    if(filterValidPaths(req.path, constants.validRoutePaths)){
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
      let route = layer.route.path;
      let changables = [":token", ":id"];

      if(filterValidPaths(route, changables)){
        _.map(foundPaths(route, changables), function(foundPath) {
          route = route.replace(foundPath, "");
        });
      }
      return route;
    }
  });
  return filterValidPaths(path, array);
}

function filterValidPaths(path, valid) {
  return !_.isEmpty(foundPaths(path, valid));
}

function foundPaths(path, valid) {
  return _.filter(valid, function(validPath) {
    return path.includes(validPath);
  });
}
/* GET root page. */

router.get('/', function (req, res, next) {
    res.render('login', {title: 'Login', error: "", message: ''});
});

router.get('/registration', function (req, res, next) {
  let params = usersRepo.prepareParams(req);

  params.phoneCountryData = replaceToString(params.phoneCountryData);
  params.landlineNumberCountryData = replaceToString(params.landlineNumberCountryData);
  res.render('registration', params);
});

router.get('/freeTrialRegistration', function (req, res, next) {
  let params = usersRepo.prepareParams(req);

  res.render('freeTrialRegistration', params);
});

router.get('/paidPlanRegistration', function (req, res, next) {
  let params = usersRepo.prepareParams(req);

  if(req.query.selected_plan) {
    params.selectedPlanOnRegistration = req.query.selected_plan;
  }

  params.phoneCountryData = replaceToString(params.phoneCountryData);
  params.landlineNumberCountryData = replaceToString(params.landlineNumberCountryData);

  res.render('paidPlanRegistration', params);
});

function replaceToString(value) {
  if(_.isEmpty(value)) {
    return '';
  }
  else {
    return value;
  }
}

router.get('/welcome', function (req, res, next) {
  res.render('welcome', usersRepo.prepareParams(req));
});

let registrationState = JSON.stringify({type: 'registration'});
router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'], state: registrationState }));
router.get('/auth/facebookFreeTrialRegistration', passport.authenticate(
  'facebook', { scope : ['email'], state: JSON.stringify({ type: 'registration', page: "freeTrialRegistration" })
}));
router.get("/auth/facebookPaiedPlanRegistration", function (req, res, next) {
  passport.authenticate(
    'facebook',
    { scope : ['email'], state: JSON.stringify({
      type: 'registration',
      page: "paidPlanRegistration",
      selectedPlanOnRegistration: req.query.selectedPlanOnRegistration
    })
  })(req, res, next)
}, function() {});

router.get('/auth/facebook/callback', function(req, res, next) {
  let returnParams = JSON.parse(req.query.state);
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return res.render('login', { title: 'Login', error: err.message, message: "" });
    }
    if (user) {
      req.login(user, function(err) {
        middlewareFilters.myDashboardPage(req, res, next);
      })
    }else{
      req.query.state = JSON.parse(req.query.state);
      if(req.query.state.type == 'registration') {
        res.locals = usersRepo.prepareParams(req);
        socialProfileMiddleware.assignProfileData(info, res.locals).then(function(resul) {
          if (returnParams.page == 'freeTrialRegistration') {
            res.render('freeTrialRegistration', {appData: res.locals, error: {}});
          }else if(returnParams.page == 'paidPlanRegistration'){
            res.locals.selectedPlanOnRegistration = returnParams.selectedPlanOnRegistration;
            res.render("paidPlanRegistration", {appData: res.locals, error: {}});
          }else{
            res.render("registration", {appData: res.locals, error: {}});
          }
        }, function(err) {
          next(err);
        })
      }
      else {
        let object = {
          params: {
            socialProfile: {
              id: info.id,
              provider: info.provider
            }
          }
        };

        req.params.token = req.query.state.token;
        req.body.social = object;
        inviteRoutes.acceptPost(req, res, next);
      }
    }
  })(req, res, next);
});

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'], state: registrationState }));
router.get('/auth/googleFreeTrialRegistration', passport.authenticate(
  'google', { scope :
    ['profile', 'email'], state: JSON.stringify({ type: 'registration', page: "freeTrialRegistration" })
}));

router.get("/auth/googlePaiedPlanRegistration", function (req, res, next) {
  passport.authenticate(
    'google',
    { scope : ['email'], state: JSON.stringify({
      type: 'registration',
      page: "paidPlanRegistration",
      selectedPlanOnRegistration: req.query.selectedPlanOnRegistration
    })
  })(req, res, next)
}, function() {});

router.get('/auth/google/callback', function(req, res, next) {
  let returnParams = JSON.parse(req.query.state);
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
        if (returnParams.page == 'freeTrialRegistration') {
          res.render('freeTrialRegistration', {appData: res.locals, error: {}});
        }else if(returnParams.page == 'paidPlanRegistration'){
          res.locals.selectedPlanOnRegistration = returnParams.selectedPlanOnRegistration;
          res.render("paidPlanRegistration", {appData: res.locals, error: {}});
        }else{
          res.render("registration", {appData: res.locals, error: {}});
        }
      }, function(err) {
        next(err)
      });
    }
  })(req, res, next);
});

router.post('/paidPlanRegistration', function (req, res, next) {
  let params = usersRepo.prepareParams(req);
  usersRepo.create(params, function (error, result) {
    if (error) {
        res.render('paidPlanRegistration', usersRepo.prepareParams(req, error));
    } else {
      let email = req.body.email;
      emailConfirmation.sendEmailConfirmationToken(email, function (err) {
        if (err) {
          res.render('welcome',  {title: 'Failed to send data. Please try later', error: 'Failed to send data. Please try later', message: '' , applicationName: process.env.MAIL_FROM_NAME});
        } else {
          res.render('welcome',  {title: 'Please verify your email address', error: "Please verify your email address", message: '' , applicationName: process.env.MAIL_FROM_NAME});
        }
      });
    };
  });
});

router.post('/freeTrialRegistration', function (req, res, next) {
  let params = usersRepo.prepareParams(req);
  params.selectedPlanOnRegistration = 'free_trial';

  usersRepo.create(params, function (error, result) {
    if (error) {
      console.log(error);
      res.render('freeTrialRegistration', usersRepo.prepareParams(req, error));
    } else {
      let email = req.body.email;
      emailConfirmation.sendEmailConfirmationToken(email, function (err) {
        if (err) {
          res.render('welcome',  {title: 'Failed to send data. Please try later', error: 'Failed to send data. Please try later', message: '' , applicationName: process.env.MAIL_FROM_NAME});
        } else {
          res.render('welcome',  {title: 'Please verify your email address', error: "Please verify your email address", message: '' , applicationName: process.env.MAIL_FROM_NAME});
        }
      });
    };
  });
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
      res.render('welcome',  {title: 'Please verify your email address', error: "Please verify your email address", message: '' , applicationName: process.env.MAIL_FROM_NAME});
    };
  });
});

router.post('/login', function(req, res, next) {
  userRoutes.login(req, res, next);
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
        tplData.error = tplData.errors.password;
        res.render('login', tplData);
      }else{
        emailConfirmation.getEmailConfirmationByToken(user, function (err, user) {
          if (err) {
            tplData.message = '';
            tplData.errors.password = "Something is wrong with email confirmation";
            res.render('/login', tplData);
          }else{
            req.login(user, function(err) {
              middlewareFilters.myDashboardPage(req, res, next);
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

router.route('/invite/auth/:provider/:token').get(function(req, res, next) {
  let state = JSON.stringify({ type: 'invite', token: req.params.token });
  switch(req.params.provider) {
    case 'google':
      return passport.authenticate('google', { scope : ['profile', 'email'], state: state })(req, res, next);
      break;
    case 'facebook':
      return passport.authenticate('facebook', { scope : ['email'], state: state })(req, res, next);
      break;
    default:
      req.redirect('/login');
  }
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

router.route('/unsubscribe/:token').get(contactListUserRoutes.unsubscribe);

module.exports = router;
