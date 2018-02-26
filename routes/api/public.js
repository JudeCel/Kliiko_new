'use strict';
var express = require('express');
var router = express.Router();
var survey = require('./survey');
var plans = require('./../root/plans');

module.exports = router;

// Public routes
router.get('/survey/find', survey.find);
router.post('/survey/answer', survey.answer);
router.post('/ping', (req, res, next) => { res.send({})});
router.get('/survey/constants', survey.getConstants);
router.get('/public/subscriptionPlans', plans.get);
