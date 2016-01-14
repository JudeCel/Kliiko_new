'use strict';
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var express = require('express');
var router = express.Router();
var policy = require('../../middleware/policy.js');

var userRoutes = require('./user');
var accountManager = require('./accountManager');
var promotionCode = require('./promotionCode');
var accountDatabase = require('./accountDatabase');
var banners = require('./banners');
var chargebee = require('./chargebee');
var gallery = require('./gallery');


module.exports = router;

// Main Routes
router.get('/user', userRoutes.userGet);
router.post('/user', userRoutes.userPost);
router.put('/user', userRoutes.changePassword);
router.post('/user/canAccess', userRoutes.userCanAccessPost);

router.get('/accountManager', policy.authorized(['accountManager', 'admin']), accountManager.get);
router.post('/accountManager', policy.authorized(['accountManager', 'admin']), accountManager.post);
router.delete('/accountManager/accountUser', policy.authorized(['accountManager', 'admin']), accountManager.removeAccountUser);
router.delete('/invite', policy.authorized(['accountManager', 'admin']), accountManager.removeInvite);

router.get('/promotionCode', policy.authorized(['admin']), promotionCode.get);
router.post('/promotionCode', policy.authorized(['admin']), promotionCode.create);
router.delete('/promotionCode/:id', policy.authorized(['admin']), promotionCode.remove);
router.put('/promotionCode/:id', policy.authorized(['admin']), promotionCode.update);

router.get('/accountDatabase', policy.authorized(['admin']), accountDatabase.get);
router.put('/accountDatabase/:id', policy.authorized(['admin']), accountDatabase.update);

router.get('/banners', banners.bannersGet);
router.post('/banners', multipartyMiddleware, banners.bannersPost);
router.post('/banners/:bannerType', multipartyMiddleware, banners.bannersBannerTypePost);
router.delete('/banners/:bannerType', multipartyMiddleware, banners.bannersDelete);

router.get('/chargebee/plans', multipartyMiddleware, chargebee.chargebeePlansGet);
router.post('/chargebee/subscription', multipartyMiddleware, chargebee.chargebeeSubscriptionPost);
router.get('/chargebee/coupon', multipartyMiddleware, chargebee.chargebeeCouponGet);

router.post('/gallery', gallery.postResources);
router.get('/gallery', gallery.getResources);
router.get('/gallery/download', gallery.downloadResources);
router.delete('/gallery', gallery.deleteResources);

// Common Rules
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
