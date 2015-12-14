"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../../lib/subdomains.js');
var changePassword = require('../../services/changePassword');
var policy = require('../../middleware/policy.js');
var uploadBannerRoutes = require('./uploadBanner.js');
var accountManagerRoutes = require('./accountManager.js');

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

router.post('/changepassword', function(req, res) {
  changePassword.save(req, function(errors, message, user){
    res.type('json');
    if (errors) {
      res.status(500).send({ error: errors.message, message: message });
    }else{
      res.status(200).send({ message: message });
    }
  });
});

router.get('/uploadbanner', policy.authorized(['admin']), uploadBannerRoutes.get);
router.post('/uploadbanner', policy.authorized(['admin']), uploadBannerRoutes.uploadFields, uploadBannerRoutes.post);
router.get('/uploadbanner/:page', policy.authorized(['admin']), uploadBannerRoutes.destroy);

router.get('/accountmanager', policy.authorized(['accountManager']), accountManagerRoutes.index);
router.get('/accountmanager/manage', policy.authorized(['accountManager']), accountManagerRoutes.manage);
router.post('/accountmanager/manage', policy.authorized(['accountManager']), accountManagerRoutes.create);
router.get('/accountmanager/remove/:type/:id', policy.authorized(['accountManager']), accountManagerRoutes.destroy);

module.exports = router;
