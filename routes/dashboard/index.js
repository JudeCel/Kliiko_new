"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../../lib/subdomains.js');
var policy = require('../../middleware/policy.js');
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
  res.locals.appData = appData;
  if (req.user) {
    // Temporarily disabled.
    // middlewareFilters.landingPage(req, res, next);
    middlewareFilters.planSelectPage(req, res, next);
  } else {
    res.redirect(subdomains.url(req, subdomains.base, '/'));
  }
});

router.get('/', policy.authorized(['admin', 'accountManager']) , function(req, res, next) {
  res.render(views_path('index'), { title: 'My Dashboard', user: req.user, message: req.flash('message')[0] });
});

router.get('/landing', function(req, res) {

  if(req.query.id && req.query.state == 'succeeded' ){
    subscriptionService.retrievCheckoutAndUpdateSub(req.query.id)
  }

  res.render(views_path('landing'), { title: 'Landing page' });
});

router.get('/paymentDetails', policy.authorized(['accountManager']), paymentDetailsRoutes.get);

router.get('/selectPlan', policy.authorized(['accountManager']), selectPlanRoutes.get);
router.post('/selectPlan', policy.authorized(['accountManager']), selectPlanRoutes.post);

router.get('/upgradeplans', function(req, res) {
  res.render(views_path('upgradePlans'), { title: 'Upgrade Plans' });
});

router.get('/accountDatabase/exportCsv', policy.authorized(['admin']), accountDatabaseRoutes.exportCsv);


module.exports = router;
