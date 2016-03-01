"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../../lib/subdomains.js');
var policy = require('../../middleware/policy.js');
var uploadBannerRoutes = require('./uploadBanner.js');
var accountDatabaseRoutes = require('./accountDatabase.js');
var appData = require('../../services/webAppData');
var middlewareFilters = require('../../middleware/filters');

function views_path(action) {
  let views_name_space = 'dashboard/';
  return views_name_space + action
}

router.use(function (req, res, next) {
  res.locals.appData = appData;
  if (req.user) {
    middlewareFilters.landingPage(req, res, next);
  } else {
    res.redirect(subdomains.url(req, 'insider', '/'));
  }
}, uploadBannerRoutes.getProfileBanner);

router.get('/', policy.authorized(['admin', 'accountManager']) , function(req, res, next) {
  res.render(views_path('index'), { title: 'My Dashboard', user: req.user, message: req.flash('message')[0] });
});

router.get('/landing', function(req, res) {
  res.render(views_path('landing'), { title: 'Landing page' });
});

router.get('/upgradeplans', function(req, res) {
  res.render(views_path('upgradePlans'), { title: 'Upgrade Plans' });
});

router.get('/uploadbanner', policy.authorized(['admin']), uploadBannerRoutes.get);
router.post('/uploadbanner', policy.authorized(['admin']), uploadBannerRoutes.uploadFields, uploadBannerRoutes.post);
router.get('/uploadbanner/:page', policy.authorized(['admin']), uploadBannerRoutes.destroy);

router.get('/accountDatabase/exportCsv', policy.authorized(['admin']), accountDatabaseRoutes.exportCsv);


module.exports = router;
