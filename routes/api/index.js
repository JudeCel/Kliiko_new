'use strict';
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var policy = require('../../middleware/policy.js');
var sessionMemberMiddleware = require('./../../middleware/sessionMember');

var userRoutes = require('./user');
var account = require('./account');
var jwt = require('./jwt');
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
var brandColour = require('./brandColour');
var session = require('./session');
var sessionBuilder = require('./sessionBuilder');
var myDashboard = require('./myDashboard');
let contactList = require('./contactList');
let contactListUser = require('./contactListUser');

let sessionMember = require('./sessionMember');

module.exports = router;

// Common Rules
router.use(function (req, res, next) {
  let exceptionPaths = ["/survey/constants", "/survey/find"];

  if (req.user || _.includes(exceptionPaths, req.path)) {
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
router.get('/account', account.get);
router.get('/jwtToken', jwt.getToken);

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
router.get('/sessionMailTemplates', mailTemplates.allSessionMailTemplatesGet);
router.post('/mailTemplate', mailTemplates.mailTemplatePost);
router.delete('/mailTemplate', mailTemplates.deleteMailTemplate);
router.post('/mailTemplate/save', mailTemplates.saveMailTemplatePost);
router.post('/mailTemplate/reset', mailTemplates.resetMailTemplatePost);
router.post('/mailTemplate/preview', mailTemplates.previewMailTemplatePost);


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
router.put('/subscriptionPlan/updatePlan', subscription.updatePlan);
router.put('/subscriptionPlan/UpdateViaCheckout', subscription.retrievCheckoutAndUpdateSub)

// Addons
router.get('/subscriptionSmsCredits', smsCredit.get);
router.post('/subscriptionSmsCredits/puchaseCredits', smsCredit.purchase);
router.get('/subscriptionSmsCredits/creditCount', smsCredit.creditCount);

// contact List
router.get('/contactLists', policy.authorized(['accountManager', 'admin']), contactList.index);
router.post('/contactLists', policy.authorized(['accountManager', 'admin']), contactList.create);
// router.post('/contactLists/:id/import', policy.authorized(['accountManager', 'admin']), fileUploader({path:process.env.FILE_UPLOAD_PATH}),contactList.parseImportFile);
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

router.post('/session/getByInvite',  policy.authorized(['accountManager', 'admin']), session.getSessionByInvite);
router.get('/session/ratings',  policy.authorized(['admin']), session.getAllSessionRatings);
router.get('/session/list', sessionMemberMiddleware.hasAccess(['facilitator', 'observer', 'participant'], ['accountManager', 'admin']), session.get);
router.delete('/session/:id', policy.authorized(['accountManager', 'admin']), session.remove);
router.post('/session/:id', policy.authorized(['accountManager', 'admin']), session.copy);



// Session Member
router.post('/sessionMember/rate/:id', sessionMemberMiddleware.hasAccess(['facilitator'], ['accountManager', 'admin']), session.updateRating);
router.post('/sessionMember/addFacilitator', sessionMember.addFacilitator);


// Session Builder
router.post('/sessionBuilder',  policy.authorized(['accountManager', 'admin']), sessionBuilder.new);
router.get('/sessionBuilder/:id',  policy.authorized(['accountManager', 'admin']), sessionBuilder.openBuild);
router.put('/sessionBuilder/:id',  policy.authorized(['accountManager', 'admin']), sessionBuilder.update);
router.post('/sessionBuilder/:id',  policy.authorized(['accountManager', 'admin']), sessionBuilder.nextStep);
router.delete('/sessionBuilder/:id',  policy.authorized(['accountManager', 'admin']), sessionBuilder.cancel);
router.post('/sessionBuilder/:id/sendSms',  policy.authorized(['accountManager', 'admin']), sessionBuilder.sendSms);
router.post('/sessionBuilder/:id/invite',  policy.authorized(['accountManager', 'admin']), sessionBuilder.inviteMembers);
router.delete('/sessionBuilder/:id/removeInvite/:inviteId',  policy.authorized(['accountManager', 'admin']), sessionBuilder.removeInvite);
router.delete('/sessionBuilder/:id/removeSessionMember/:sessionMemberId',  policy.authorized(['accountManager', 'admin']), sessionBuilder.removeSessionMember);
router.post('/sessionBuilder/:id/sendGenericEmail',  policy.authorized(['accountManager', 'admin']), sessionBuilder.sendGenericEmail);
router.post('/sessionBuilder/:id/addTopics',  policy.authorized(['accountManager', 'admin']), sessionBuilder.addTopics);

router.post('/sessionBuilder/:id/step/next',  policy.authorized(['accountManager', 'admin']), sessionBuilder.nextStep );
router.post('/sessionBuilder/:id/step/previous',  policy.authorized(['accountManager', 'admin']), sessionBuilder.prevStep);
