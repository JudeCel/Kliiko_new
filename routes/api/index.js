'use strict';
var fileUploader = require('./../../middleware/fileUploader.js');
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
var survey = require('./survey');
var chargebee = require('./chargebee');
var gallery = require('./gallery');
var brandColour = require('./brandColour');
var chatSessions = require('./chatSessions');


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
router.put('/chargebee/subscription', multipartyMiddleware, chargebee.chargebeeSubscriptionPut);
router.get('/chargebee/subscriptions', multipartyMiddleware, chargebee.chargebeeSubscriptionGet);
router.get('/chargebee/coupon', multipartyMiddleware, chargebee.chargebeeCouponGet);

router.post('/gallery', gallery.postResources);
router.post('/gallery/uploadFile', fileUploader(), gallery.uploadResource);
router.post('/gallery/saveYoutubeUrl', gallery.saveYoutubeResource);
router.get('/gallery', gallery.getResources);
router.get('/gallery/download', gallery.downloadResources);
router.delete('/gallery', gallery.deleteResources);

router.get('/chargebee/tst', multipartyMiddleware, chargebee.tstGet);

router.get('/survey', survey.get);
router.delete('/survey', survey.remove);
router.post('/survey', survey.create);
router.put('/survey', survey.update);
router.post('/survey/copy', survey.copy);
router.put('/survey/status', survey.status);
router.get('/survey/find', survey.find);
router.post('/survey/answer', survey.answer);
router.put('/survey/confirm', survey.confirm);
router.get('/survey/constants', survey.getConstants);

router.get('/brandColour', brandColour.get);
router.delete('/brandColour', brandColour.remove);
router.post('/brandColour', brandColour.create);
router.put('/brandColour', brandColour.update);
router.post('/brandColour/copy', brandColour.copy);

router.get('/sessions', chatSessions.get);
router.delete('/sessions', chatSessions.remove);
router.post('/sessions/copy', chatSessions.copy);

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
