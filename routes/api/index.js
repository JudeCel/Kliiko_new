'use strict';
var fileUploader = require('./../../middleware/fileUploader.js');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var express = require('express');
var router = express.Router();
var policy = require('../../middleware/policy.js');
var config = require('config');
var sessionMemberMiddleware = require('./../../middleware/sessionMember');

var userRoutes = require('./user');
var accountUser = require('./accountUser');
var accountManager = require('./accountManager');
var promotionCode = require('./promotionCode');
var accountDatabase = require('./accountDatabase');
var banners = require('./banners');
var survey = require('./survey');
var subscription = require('./subscription');
var smsCredit = require('./smsCredit');
var mailTemplates = require('./mailTemplate');
let topic = require('./topic');
var gallery = require('./gallery');
var brandColour = require('./brandColour');
var session = require('./session');
var myDashboard = require('./myDashboard');

let contactList = require('./contactList');
let contactListUser = require('./contactListUser');

module.exports = router;

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

// Main Routes
router.get('/myDashboard/data', myDashboard.getAllData);

router.get('/user', userRoutes.userGet);
router.post('/user', userRoutes.userPost);
router.put('/user', userRoutes.changePassword);
router.post('/user/canAccess', userRoutes.userCanAccessPost);
router.get('/accountUser', accountUser.get);

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

router.get('/mailTemplates', mailTemplates.allMailTemplatesGet);
router.post('/mailTemplate', mailTemplates.mailTemplatePost);
router.delete('/mailTemplate', mailTemplates.deleteMailTemplate);
router.post('/mailTemplate/save', mailTemplates.saveMailTemplatePost);
router.post('/mailTemplate/reset', mailTemplates.resetMailTemplatePost);
router.post('/mailTemplate/preview', mailTemplates.previewMailTemplatePost);

router.post('/gallery', gallery.postResources);
router.post('/gallery/uploadFile', fileUploader(), gallery.uploadResource);
router.post('/gallery/saveYoutubeUrl', gallery.saveYoutubeResource);
router.post('/gallery/deleteZipFile', gallery.deleteZipFile);
router.get('/gallery', gallery.getResources);
router.get('/gallery/download', gallery.downloadResources);
router.delete('/gallery', gallery.deleteResources);

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

// Subscription
router.get('/subscriptionPlan', subscription.getPlans);
router.get('/subscriptionSmsCredits', smsCredit.getList);

// contact List
router.get('/contactLists', policy.authorized(['accountManager', 'admin']), contactList.index);
router.post('/contactLists', policy.authorized(['accountManager', 'admin']), contactList.create);
router.post('/contactLists/:id/import', policy.authorized(['accountManager', 'admin']), fileUploader({path:config.get('fileUploadPath')}),contactList.parseImportFile);
router.put('/contactLists/:id/import', policy.authorized(['accountManager', 'admin']),contactList.importContacts);
router.put('/contactLists/:id', policy.authorized(['accountManager', 'admin']), contactList.update);
router.delete('/contactLists/:id', policy.authorized(['accountManager', 'admin']), contactList.destroy);

// contact List User
router.post('/contactListsUser', policy.authorized(['accountManager', 'admin']), contactListUser.create);
router.post('/contactListsUsersToRemove', policy.authorized(['accountManager', 'admin']), contactListUser.destroy);
router.put('/contactListsUser/:id', policy.authorized(['accountManager', 'admin']), contactListUser.update);

router.get('/topics', multipartyMiddleware, topic.get);
router.post('/topic', multipartyMiddleware, topic.post);
router.put('/topic/:id',multipartyMiddleware, topic.updateById);
router.delete('/topic/:id', multipartyMiddleware, topic.deleteById);

router.get('/brandColour', brandColour.get);
router.delete('/brandColour', brandColour.remove);
router.post('/brandColour', brandColour.create);
router.put('/brandColour', brandColour.update);
router.post('/brandColour/copy', brandColour.copy);

router.get('/session/ratings',  policy.authorized(['admin']), session.getAllSessionRatings);
router.get('/session/list', sessionMemberMiddleware.hasAccess(['facilitator', 'observer', 'participant'], ['accountManager', 'admin']), session.get);
router.delete('/session/:id', policy.authorized(['accountManager', 'admin']), session.remove);
router.post('/session/:id', policy.authorized(['accountManager', 'admin']), session.copy);
router.post('/sessionMember/rate/:id', sessionMemberMiddleware.hasAccess(['facilitator'], ['accountManager', 'admin']), session.updateRating);
