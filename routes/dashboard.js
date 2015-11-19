"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../lib/subdomains.js');
var changePassword = require('../services/changePassword');
var policy = require('../middleware/policy.js');

function views_path(action) {
let views_name_space = "dashboard/";
  return views_name_space + action
}

router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect(subdomains.url(req, 'insider', '/'));
  }
});

router.get('/', function(req, res, next) {
  policy.authorized(["admin", "accountManager"], req, res, function() {
    res.render(views_path('index'), { title: '', user: req.user });
  });
});

router.get('/changepassword', function(req, res) {
  res.render(views_path('changePassword'), { title: '', user: req.user, error: "", message: "" });
});

router.post('/changepassword', function(req, res) {
  changePassword.save(req, function(errors, message, user){
    if (errors) {
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: errors.message, message: message });
    }else{
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: "", message: message });
    }
  });
});

module.exports = router;
