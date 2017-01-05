"use strict";
var express = require('express');
var router = express.Router();
var jwtToken = require('../../lib/jwt.js');
var subdomains = require('../../lib/subdomains.js');
var policy = require('../../middleware/policy.js');
var models = require('../../models');
var accountDatabaseRoutes = require('./accountDatabase.js');
var paymentDetailsRoutes = require('./paymentDetails.js');
var selectPlanRoutes = require('./selectPlan.js');
var appData = require('../../services/webAppData');
var middlewareFilters = require('../../middleware/filters');
var subscriptionService = require('../../services/subscription');

function views_path(action) {
  let views_name_space = 'dashboard/';
  return views_name_space + action
}

router.use(function (req, res, next) {
  if (req.user) {
    middlewareFilters.planSelectPage(req, res, next);
  } else {
    res.redirect(subdomains.url(req, subdomains.base, '/'));
  }
});

router.get('/', policy.authorized(['facilitator','admin', 'accountManager']) , function(req, res, next) {
  res.locals.jwt_token = jwtToken.token(req.currentResources.accountUser.id, "AccountUser:", "/" )
  res.locals.currentResources = req.currentResources
  res.render(views_path('index'), { title: 'My Account Hub', appData: appData, message: req.flash('message')[0] });
});

router.get('/landing', function(req, res) {
  if(req.query.id && req.query.state == 'succeeded' ){
    subscriptionService.retrievCheckoutAndUpdateSub(req.query.id)
  }

  res.render(views_path('landing'), { title: 'Landing page' });
});

router.get('/tour', function(req, res) {
  res.render(views_path('tour'), { title: 'Tour videos' });
});

router.get('/paymentDetails', policy.authorized(['accountManager']), paymentDetailsRoutes.get);

router.get('/selectPlan', policy.authorized(['accountManager']), selectPlanRoutes.get);
router.post('/selectPlan', policy.authorized(['accountManager']), selectPlanRoutes.post);

router.get('/upgradeplans', function(req, res) {
  res.render(views_path('upgradePlans'), { title: 'Upgrade Plans' });
});

router.get('/accountDatabase/exportCsv', policy.authorized(['admin']), accountDatabaseRoutes.exportCsv);


module.exports = router;
