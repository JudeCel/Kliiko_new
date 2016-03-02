"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../../lib/subdomains.js');
var policy = require('../../middleware/policy.js');
var appData = require('../../services/webAppData');
var surveyRoutes = require('./survey.js');

router.use(function (req, res, next) {
  res.locals.appData = appData;
  if (req.user) {
    next();
  } else {
    res.redirect(subdomains.url(req, subdomains.base, '/'));
  }
});

router.get('/survey/export/:id', policy.authorized(['admin', 'accountManager']), surveyRoutes.exportSurvey);

module.exports = router;
