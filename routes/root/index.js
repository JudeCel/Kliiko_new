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
var ghostUserRoutes = require('./ghostUser');
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
var ics = require('./ics');
var uuid = require('node-uuid');
var accountUserService = require('../../services/accountUser');
var exec = require('child_process').exec;
var ipCurrency = require('../../lib/ipCurrency');
const facebookUrl = '/auth/facebook';
const googleUrl = '/auth/google';
var planConstants = require('./../../util/planConstants');


router.route('/ics').get(ics.render);

router.use(function (req, res, next) {
  res.locals.appData = appData;
    if (isPublicPath(req.path)) {
      return next();
    }

    if(filterValidPaths(req.path, constants.validRoutePaths)){
      next();
    }else{
      let user = req.user;
      let account = req.currentResources && req.currentResources.account;

      if(user && account){
        if(req.path.includes("/account-hub")){
          next();
        }else{
          res.redirect(subdomains.url(req, req.currentResources.account.subdomain, '/account-hub'));
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

function isPublicPath(path) {
  return path == '/logout' || path.startsWith('/VerifyEmail/') || path.startsWith('/session/');
}

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

router.get('/updatePackages', function(req, res, next) {
  if(req.query.token !== 'securityToken123') return res.status(404).send({ error: "Invalid token" });

  exec('yarn outdated --color', (error, stdout, stderr) =>{
    if(error) {
      res.status(404).send({ error: error });
    }
    else {
      res.send({ status: 'ok', data: stdout });
    }
  });
});

router.get('/ping', function(req, res, next) {
  res.send({ status: 'ok' });
});

router.get('/', function (req, res, next) {
  res.render('login', {
    title: 'Login',
    error: "",
    message: '',
    email: '',
    googleUrl: googleUrl,
    facebookUrl: facebookUrl
  });
});

function randomNumberForAccountName(name) {
  return _.uniqueId(name);
}

function prepareUrlParams(parameters, query) {
  parameters.selectedPlanOnRegistration = "";
  if (query) {
    if (query.name) {
      parameters.firstName = query.name;
      query.showOptionalFields = false;
      parameters.accountName = randomNumberForAccountName(query.name);
      parameters.showOptionalFields = false;
    }
    if (query.email) {
      parameters.email = query.email;
      parameters.showOptionalFields = false;
    }

    parameters.currency = query.currency;
    if (_.hasIn(query, 'package')) {
      parameters.showOptionalFields = false;
      if (query.package) {
        parameters.page = query.package === planConstants.TRIAL_PLAN_NAME ? 'freeTrialRegistration' : 'paidPlanRegistration';
        parameters.selectedPlanOnRegistration = query.package;
      } else {
        parameters.page = 'paidPlanRegistration';
        parameters.selectedPlanOnRegistration = planConstants.DEFAULT_PLAN_NAME;
      }
    }
    else if(query.selectedPlanOnRegistration) {
      parameters.infusionEmail = query.infusionEmail;
      parameters.selectedPlanOnRegistration = query.selectedPlanOnRegistration;
    }
  }

  if (typeof(parameters.showOptionalFields) != "boolean") {
    parameters.showOptionalFields = (parameters.showOptionalFields == "true");
  }
}

function prepareViewFormParams(params) {
      params.showSignUpToNewsletter = process.env.REGISTRATION_SHOW_SIGN_UP_TO_NEWSLETTER !== 'false';
}

router.get('/registration', function (req, res, next) {
  let params = getParams(req);
  params.phoneCountryData = replaceToString(params.phoneCountryData);
  params.landlineNumberCountryData = replaceToString(params.landlineNumberCountryData);
  prepareUrlParams(params, req.query);
  prepareViewFormParams(params);
  params.currency = params.currency || "";
  res.render('registration', params);
});

router.get('/freeTrialRegistration', function (req, res, next) {
  let params = getParams(req);
  res.render('freeTrialRegistration', params);
});

router.get('/paidPlanRegistration', function (req, res, next) {
  let params = getParams(req);

  if(req.query.selected_plan) {
    params.selectedPlanOnRegistration = req.query.selected_plan;
  }

  params.phoneCountryData = replaceToString(params.phoneCountryData);
  params.landlineNumberCountryData = replaceToString(params.landlineNumberCountryData);

  res.render('paidPlanRegistration', params);
});

function getParams(req) {
  let params = usersRepo.prepareParams(req);
  params.facebookUrl = facebookUrl;
  params.googleUrl = googleUrl;

  return params;
}

function replaceToString(value) {
  if(_.isEmpty(value)) {
    return '';
  }
  else {
    return value;
  }
}

router.get('/welcome', function (req, res, next) {
  loadWelcomePage(req, res, true, null);
});

router.post('/welcome', function(req, res, next) {
  emailConfirmation.isConfirmed(req.session.email).then((response) => {
    emailConfirmation.checkTokenExpired(response.token, function (err, user) {
      let accountUserId = response.accountUserId ? parseInt(new Buffer(response.accountUserId, 'base64').toString('ascii')) : null;
        if(response.isConfirmed) {
          req.logout();
          user.increment('signInCount').done(function(result) {
            req.session.landed = true;
            req.login(user, function(err) {
              middlewareFilters.myDashboardPage(req, res, next, accountUserId, false);
            });
          });
        } else {
          loadWelcomePage(req, res, response.isConfirmed, null);
        }
      });
  }, (error) => {
    loadWelcomePage(req, res, true, error);
  });
});

function loadWelcomePage(req, res, isConfirmed, error) {
  let tplData = {
    title: 'Welcome',
    error: error,
    success: '',
    email: req.session.email,
    isConfirmed: isConfirmed,
    applicationName: process.env.MAIL_FROM_NAME
  };

  res.render('welcome', tplData);
}

router.post('/resendEmail', function(req, res, next) {
  emailConfirmation.sendEmailConfirmationToken(req.session.email, function (err) {
    res.status(err ? 500 : 200).send({});
  });
});

router.route('/session/:uid').get(ghostUserRoutes.get).post(ghostUserRoutes.post);

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
  handleSocialCallback(req, res, next, 'facebook');
});

router.get('/auth/google/callback', function(req, res, next) {
  handleSocialCallback(req, res, next, 'google');
});

function handleSocialCallback (req, res, next, provider) {
  let returnParams = JSON.parse(req.query.state);
  passport.authenticate(provider, function(err, user, info) {
    if (err) {
      return res.render('login', {
        title: 'Login',
        error: err.message,
        message: "",
        email: "",
        googleUrl: googleUrl,
        facebookUrl: facebookUrl
       });
    }

    if (user) {
      req.login(user, function(err) {
        middlewareFilters.myDashboardPage(req, res, next);
      });
    } else {
      req.query.state = JSON.parse(req.query.state);
      if (isInviteSocialCallback(req.query.state.type)) {
        req.params.token = returnParams.token;
        acceptInviteViaSocial(req, res, next, info, provider);
      } else if(isRegistrationSocialCallback(req.query.state.type)) {
        registerUsingSocialData(res, req, returnParams, info);
      } else {
        return res.render('login', {
          title: 'Login',
          googleUrl: googleUrl,
          facebookUrl: facebookUrl
         });
      }
    }
  })(req, res, next);
}

function acceptInviteViaSocial(req, res, next, info, provider) {
  var password = uuid.v1();
  req.body.password = password;
  req.body.social = {
    user: {},
    params: {socialProfile: { provider: provider, id: info.id }}
  };
  inviteRoutes.accept(req, res, next);
}

function registerUsingSocialData(res, req, returnParams, info) {
  res.locals = usersRepo.prepareParams(req);
  socialProfileMiddleware.assignProfileData(info, res.locals).then(function(resul) {
    if (returnParams.page == 'freeTrialRegistration') {
      res.render('freeTrialRegistration', getRegistrationPageParams(res.locals, req.query));
    }else if(returnParams.page == 'paidPlanRegistration'){
      res.locals.selectedPlanOnRegistration = returnParams.selectedPlanOnRegistration;
      res.render("paidPlanRegistration", getRegistrationPageParams(res.locals, req.query));
    }else{
      res.render("registration", getRegistrationPageParams(res.locals, req.query));
    }
  }, function(err) {
    next(err);
  });
}

function getRegistrationPageParams (appData, query) {
  return {
    appData: appData,
    error: {},
    googleUrl: googleUrl,
    facebookUrl: facebookUrl,
    selectedPlanOnRegistration: query.package,
    currency: query.currency,
  };
}

function isInviteSocialCallback(type) {
  return type == 'invite';
}

function isRegistrationSocialCallback(type) {
  return type == 'registration';
}

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

function createUserAndSendEmail(req, res, userParams, renderInfo) {
  usersRepo.create(userParams, function(error, result) {
    if(error) {
      let params = usersRepo.prepareParams(req, error);
      prepareUrlParams(params, req.query);

      if (renderInfo.failed == "registration") {
        params.facebookUrl = facebookUrl;
        params.googleUrl = googleUrl;
      }

      res.render(renderInfo.failed, params);
    }
    else {
      let tplData = {
        title: 'Email Confirmation',
        error: '',
        success: '',
        email: req.body.email,
        applicationName: process.env.MAIL_FROM_NAME
      };

      //let email = req.body.email;
      emailConfirmation.sendEmailConfirmationToken(tplData.email, function (err) {
        if (err) {
          tplData.error = 'Failed to send data. Please try later';
        } else {
          tplData.success = 'Email confirmation sent to ' + tplData.email;
        }
        //res.render(renderInfo.success, tplData);

        req.session.email = tplData.email;
        res.redirect('/welcome')
      });
    };
  });
}

router.post('/paidPlanRegistration', function (req, res, next) {
  let userParams = usersRepo.prepareParams(req);
  createUserAndSendEmail(req, res, userParams, { failed: 'paidPlanRegistration', success: 'welcome' });
});

router.post('/freeTrialRegistration', function (req, res, next) {
  let userParams = usersRepo.prepareParams(req);
  userParams.selectedPlanOnRegistration = 'free_trial';
  createUserAndSendEmail(req, res, userParams, { failed: 'freeTrialRegistration', success: 'welcome' });
});

router.post('/registration', function (req, res, next) {
  let userParams = usersRepo.prepareParams(req);
  prepareUrlParams(userParams, req.body);
  if(userParams.currency) {
    createUserAndSendEmail(req, res, userParams, { failed: 'registration', success: 'welcome' });
  }
  else {
    ipCurrency.get({ ip: req.headers[ 'x-real-ip'] }).then((data) => {
      userParams.currency = data.client;
      createUserAndSendEmail(req, res, userParams, { failed: 'registration', success: 'welcome' });
    }, () => {
      createUserAndSendEmail(req, res, userParams, { failed: 'registration', success: 'welcome' });
    });
  }
});

router.post('/login', function(req, res, next) {
  userRoutes.login(req, res, next);
});

router.post('/auth', function(req, res, next) {
  userRoutes.auth(req, res, next);
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login',
    error: '',
    message: req.flash('message')[0],
    email: req.flash('email')[0],
    googleUrl: googleUrl,
    facebookUrl: facebookUrl
   });
});

router.route('/VerifyEmail/:token/:accountUserId?')
  .get(function (req, res, next) {
    let tplData = {
      title: 'Email Confirmation',
      user: true,
      token: req.params.token,
      accountUserId: req.params.accountUserId,
      errors: {}
    };

    emailConfirmation.checkTokenExpired(req.params.token, function (err, user) {
      if (err || !user) {
        tplData.user = false;
        tplData.errors.password = '';
        tplData.message = '';
        tplData.email = '';
        tplData.error = tplData.errors.password;
        tplData.googleUrl = googleUrl;
        tplData.facebookUrl = facebookUrl;
        res.render('login', tplData);
      } else {
        let accountUserId = tplData.accountUserId ? parseInt(new Buffer(tplData.accountUserId, 'base64').toString('ascii')) : null;
        emailConfirmation.getEmailConfirmationByToken(user, accountUserId, function (err, user) {
          if (err) {
            tplData.message = '';
            tplData.errors.password = "Something is wrong with email confirmation";
            res.render('/login', tplData);
          } else {
            req.logout();
            user.increment('signInCount').done(function(result) {
              req.login(user, function(err) {
                middlewareFilters.myDashboardPage(req, res, next, accountUserId, true);
              });
            });
          };
        });
      }
    });
  });

router.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
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
router.route('/invite/:token/accept').get(inviteRoutes.accept);
router.route('/invite/:token/accept').post(inviteRoutes.accept);

router.route('/invite/:token/session').get(inviteRoutes.sessionAccept);
router.route('/invite/:token/notThisTime').get(inviteRoutes.sessionNotThisTime);
router.route('/invite/:token/notAtAll').get(inviteRoutes.sessionNotAtAll);


router.route('/survey/:id').get(surveyRoutes.index);

router.route('/my-dashboard').get(myDashboardRoutes.index);
router.route('/my-dashboard/tour').get(myDashboardRoutes.tour);

router.route('/chargebee/webhooks').post(chargebeeRoutes.endPoint);

router.route('/unsubscribe/:token').get(contactListUserRoutes.unsubscribe);


router.get('/privacy_policy', function(req, res, next) {
  res.render('privacy_policy', { title: 'Privacy Policy' });
});

router.get('/terms_of_use', function(req, res, next) {
  res.render('terms_of_use', { title: 'Terms of Use' });
});
router.get('/terms_of_use_participant', function(req, res, next) {
  res.render('terms_of_use_participant', { title: 'Terms of Use' });
});

router.get('/close_session/participate/:sessionId/:id', function(req, res, next) {
  renderCloseSessionView(res, constants.closeSession.confirmedParticipationMessage);
});

router.get('/close_session/dont_participate/:sessionId/:id', function(req, res, next) {
  var accountUserId = new Buffer(req.params.id, 'base64').toString('ascii');
  accountUserService.updateNotInFutureInfo(accountUserId, req.params.sessionId).then(function() {
      renderCloseSessionView(res, constants.closeSession.declinedParticipationMessage);
  }, function(error) {
      renderCloseSessionView(res, error);
  });
});

router.get('/system_requirements', function (req, res, next) {
  res.render('systemRequirements', { title: 'System Requirements'});
});

function renderCloseSessionView(res, closeSessionText) {
  res.render('closeSession', {
     message: closeSessionText,
     title: ''
   });
}

module.exports = router;
