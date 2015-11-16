"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../lib/subdomains.js');
var changePassword = require('../repositories/changePassword');

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
  res.render(views_path('index'), { title: '', user: req.user });
});

router.get('/changepassword', function(req, res) {
  res.render(views_path('changePassword'), { title: '', user: req.user, error: "", message: "" });
});

router.post('/changepassword', function(req, res) {
  let message = ""

  changePassword.save(req, function(errors, user){
    if (errors) {
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: errors.message, message: message });
    }else{
      message = "Password successfully change."
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: {}, message: message });
    }
  });
});

module.exports = router;
