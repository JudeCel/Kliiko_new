"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../lib/subdomains.js');
var changePassword = require('../services/changePassword');
var policy = require('../middleware/policy.js');
var uploadBanner = require('../middleware/uploadBanner.js');

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
  res.render(views_path('index'), { title: 'My Dashboard', user: req.user });
});

router.get('/landing', function(req, res) {
  res.render(views_path('landing'), { title: 'Landing page' });
});

router.get('/upgradeplans', function(req, res) {
  res.render(views_path('upgradePlans'), { title: 'Upgrade Plans' });
});

router.get('/changepassword', function(req, res) {
  res.render(views_path('changePassword'), { title: 'Change Password', user: req.user, error: "", message: "" });
});

router.post('/changepassword', function(req, res) {
  changePassword.save(req, function(errors, message, user){
    if (errors) {
      res.render(views_path('changePassword'), { title: 'Change Password', user: req.user, error: errors.message, message: message });
    }else{
      res.render(views_path('changePassword'), { title: 'Change Password', user: req.user, error: "", message: message });
    }
  });
});

router.get('/uploadbanner', policy.authorized(['admin']), uploadBanner.get);
router.post('/uploadbanner', policy.authorized(['admin']), uploadBanner.uploadFields, uploadBanner.post);
router.get('/uploadbanner/:page', policy.authorized(['admin']), uploadBanner.destroy);

module.exports = router;
