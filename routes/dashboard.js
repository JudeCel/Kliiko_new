"use strict";
var express = require('express');
var router = express.Router();

function views_path(action) {
let views_name_space = "dashboard/"
  return views_name_space + action
}

router.use(function (req, res, next) {
  console.log("==================dashboard================");
  console.log(req.headers);
  console.log("==================dashboard END================");
  next();
});

router.get('/', function(req, res, next) {
  res.render(views_path('index'), { title: '', user: req.user });
});

module.exports = router;
