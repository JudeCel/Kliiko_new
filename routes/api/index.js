'use strict';

var express = require('express');
var router = express.Router();
var policy = require('../../middleware/policy.js');

var userRoutes = require('./user');
var planRoutes = require('./plans');
var countryAndCurrency = require('./country-and-currency-data');
var accountManager = require('./accountManager');
var promotionCode = require('./promotionCode');

router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    notAuthExit(res);
  }
});

//Common not authorized message
function notAuthExit(res) {
  res.status(403).send('not authorized');
}

router.get('/user', userRoutes.userGet);
router.post('/user', userRoutes.userPost);
router.get('/plans', planRoutes.plansGet);
router.get('/currencies', countryAndCurrency.currencies);
router.get('/countries', countryAndCurrency.countries);

router.get('/accountManager', policy.authorized(['accountManager']), accountManager.get);
router.post('/accountManager', policy.authorized(['accountManager']), accountManager.post);
router.delete('/accountManager', policy.authorized(['accountManager']), accountManager.remove);

router.get('/promotionCode', policy.authorized(['admin']), promotionCode.get);
router.post('/promotionCode', policy.authorized(['admin']), promotionCode.create);
router.delete('/promotionCode/:id', policy.authorized(['admin']), promotionCode.remove);
router.put('/promotionCode/:id', policy.authorized(['admin']), promotionCode.update);

module.exports = router;
