"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../lib/subdomains.js');
var changePassword = require('../services/changePassword');
var policy = require('../middleware/policy.js');
var uploadBanner = require('../middleware/uploadBanner.js');
var accountDatabase = require('../middleware/accountDatabase.js');
var appData = require('../services/webAppData');


function views_path(action) {
  let views_name_space = 'dashboard/';
  return views_name_space + action
}

router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect(subdomains.url(req, 'insider', '/'));
  }
}, uploadBanner.getProfileBanner);

router.get('/', policy.authorized(['admin', 'accountManager']) , function(req, res, next) {
  res.render(views_path('index'), { title: 'My Dashboard', user: req.user, appData: appData });
});

router.get('/landing', function(req, res) {
  res.render(views_path('landing'), { title: 'Landing page' , appData: appData});
});

router.get('/upgradeplans', function(req, res) {
  res.render(views_path('upgradePlans'), { title: 'Upgrade Plans', appData: appData });


router.post('/changePassword', function(req, res) {
  changePassword.save(req, function(errors, message, user){
    res.type('json');
    if (errors) {
      res.status(500).send({ error: errors.message, message: message });
    }else{
      res.status(200).send({ message: message });
    }
  });
});

router.get('/uploadBanner', policy.authorized(['admin']), uploadBanner.get);
router.post('/uploadBanner', policy.authorized(['admin']), uploadBanner.uploadFields, uploadBanner.post);
router.get('/uploadBanner/:page', policy.authorized(['admin']), uploadBanner.destroy);

// Account Database
router.get('/accountDatabase', policy.authorized(['admin']), accountDatabase.get);
router.get('/exportCsv', policy.authorized(['admin']), accountDatabase.exportCsv);
router.post('/updateComment', policy.authorized(['admin']), accountDatabase.updateComment);
router.post('/reactivateOrDeactivate', policy.authorized(['admin']), accountDatabase.reactivateOrDeactivate);
// End

module.exports = router;
