"use strict";
var express = require('express');
var router = express.Router();

function views_path(action) {
let views_name_space = "dashboard/"
  return views_name_space + action
}

router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
});

router.get('/', function(req, res, next) {
  res.render(views_path('index'), { title: '', user: req.user });
});

module.exports = router;
