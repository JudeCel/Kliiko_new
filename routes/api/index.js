'use strict';

var express = require('express');
var router = express.Router();

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

router.get('/accountManager', accountManager.get);
router.post('/accountManager', accountManager.post);
router.delete('/accountManager', accountManager.remove);

router.get('/promotionCode', promotionCode.get);
router.post('/promotionCode', promotionCode.create);
router.delete('/promotionCode/:id', promotionCode.remove);
router.put('/promotionCode/:id', promotionCode.update);

module.exports = router;
