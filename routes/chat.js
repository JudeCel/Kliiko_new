"use strict";
var express = require('express');
var router = express.Router();

function views_path(action) {
let views_name_space = "chat/"
  return views_name_space + action
}

router.use(function (req, res, next) {
  next();
});

router.get('/' , function(req, res, next) {
  res.render(views_path('topic'));
});

module.exports = router;
