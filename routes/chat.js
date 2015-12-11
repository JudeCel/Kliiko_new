"use strict";
var express = require('express');
var router = express.Router();
var sessionMember = require('../middleware/sessionMember.js');

function views_path(action) {
let views_name_space = "chat/"
  return views_name_space + action
}

router.use(function (req, res, next) {
  next();
});

router.get('/iFrame', function(req, res, next) {
  res.render(views_path('iFrame'));
});

router.get('/:id' , sessionMember.hasAccess, function(req, res, next) {
  res.render(views_path('topic'), { title: 'chat', user: req.user, id: req.params.id });
});

module.exports = router;
