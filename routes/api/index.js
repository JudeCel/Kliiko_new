'use strict';
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var express = require('express');
var _ = require('lodash');
var router = express.Router();
var contactListImport = require('../../middleware/contactListImport.js');
var policy = require('../../middleware/policy.js');
var sessionMemberMiddleware = require('./../../middleware/sessionMember');

var userRoutes = require('./user');
var account = require('./account');
var jwt = require('./jwt');
var accountUser = require('./accountUser');
var accountManager = require('./accountManager');
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

var PERMISSIONS = {
  admin: policy.authorized(['admin']),
  managerAdmin: policy.authorized(['accountManager', 'admin']),
  facilitatorManagerAdmin: sessionMemberMiddleware.hasAccess(['facilitator'], ['accountManager', 'admin'])
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
router.get('/jwtTokenForMember', jwt.jwtTokenForMember);

router.get('/accountManager', PERMISSIONS.managerAdmin, accountManager.get);
router.post('/accountManager', PERMISSIONS.managerAdmin, accountManager.post);
router.put('/accountManager', PERMISSIONS.managerAdmin, accountManager.put);
router.delete('/accountManager/accountUser', PERMISSIONS.managerAdmin, accountManager.removeAccountUser);
router.delete('/invite', PERMISSIONS.managerAdmin, accountManager.removeInvite);
router.get('/accountManager/canAddAccountManager', PERMISSIONS.managerAdmin, accountManager.canAddAccountManager);

router.get('/accountDatabase', PERMISSIONS.admin, accountDatabase.get);
router.put('/accountDatabase/:id', PERMISSIONS.admin, accountDatabase.update);

router.post('/banners', banners.create);
router.put('/banners', banners.update);

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
router.get('/survey/canExportSurveyData', survey.canExportSurveyData);

// Subscription
router.get('/subscriptionPlan', subscription.getPlans);
router.put('/subscriptionPlan/updatePlan', subscription.updatePlan);
router.put('/subscriptionPlan/UpdateViaCheckout', subscription.retrievCheckoutAndUpdateSub)
router.post('/subscriptionPlan/postQuote', subscription.postQuote)

// Addons
router.get('/subscriptionSmsCredits', smsCredit.get);
router.post('/subscriptionSmsCredits/puchaseCredits', smsCredit.purchase);
router.get('/subscriptionSmsCredits/creditCount', smsCredit.creditCount);

// contact List
router.get('/contactLists', PERMISSIONS.facilitatorManagerAdmin, contactList.index);
router.post('/contactLists', PERMISSIONS.facilitatorManagerAdmin, contactList.create);

router.post('/contactLists/:id/import', PERMISSIONS.facilitatorManagerAdmin, contactListImport.single('uploadedfile'), contactList.parseImportFile);
router.put('/contactLists/:id/import', PERMISSIONS.facilitatorManagerAdmin, contactList.importContacts);
router.post('/contactLists/:id/validate', PERMISSIONS.facilitatorManagerAdmin, contactList.validateContacts);

router.put('/contactLists/:id', PERMISSIONS.facilitatorManagerAdmin, contactList.update);
router.delete('/contactLists/:id', PERMISSIONS.facilitatorManagerAdmin, contactList.destroy);

// contact List User
router.post('/contactListsUser', PERMISSIONS.facilitatorManagerAdmin, contactListUser.create);
router.post('/contactListsUsersToRemove', PERMISSIONS.facilitatorManagerAdmin, contactListUser.destroy);
router.put('/contactListsUser/:id', PERMISSIONS.facilitatorManagerAdmin, contactListUser.update);

router.get('/topics', multipartyMiddleware, topic.get);
router.post('/topic', multipartyMiddleware, topic.post);
router.put('/topic/updateSessionTopicName', multipartyMiddleware, topic.updateSessionTopicName);
router.put('/topic/:id',multipartyMiddleware, topic.updateById);
router.delete('/topic/:id', multipartyMiddleware, topic.deleteById);

router.get('/brandColour', brandColour.get);
router.delete('/brandColour', brandColour.remove);
router.post('/brandColour', brandColour.create);
router.put('/brandColour', brandColour.update);
router.post('/brandColour/copy', brandColour.copy);
router.get('/brandColour/canCreateCustomColors', brandColour.canCreateCustomColors);

router.post('/session/getByInvite',  PERMISSIONS.managerAdmin, session.getSessionByInvite);
router.get('/session/ratings',  PERMISSIONS.admin, session.getAllSessionRatings);
router.get('/session/list', sessionMemberMiddleware.hasAccess(['facilitator', 'observer', 'participant'], ['accountManager', 'admin']), session.get);
router.delete('/session/:id', PERMISSIONS.managerAdmin, session.remove);
router.post('/session/:id', PERMISSIONS.managerAdmin, session.copy);



// Session Member
router.post('/sessionMember/comment/:id', PERMISSIONS.facilitatorManagerAdmin, session.comment);
router.post('/sessionMember/rate/:id', PERMISSIONS.facilitatorManagerAdmin, session.updateRating);
router.post('/sessionMember/addFacilitator', PERMISSIONS.managerAdmin, sessionMember.addFacilitator);


// Session Builder
router.get('/sessionBuilder/canAddObservers',  PERMISSIONS.managerAdmin, sessionBuilder.canAddObservers);

router.post('/sessionBuilder', PERMISSIONS.managerAdmin, sessionBuilder.new);
router.get('/sessionBuilder/:id', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.openBuild);
router.put('/sessionBuilder/:id', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.update);
router.post('/sessionBuilder/:id', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.nextStep);
router.delete('/sessionBuilder/:id', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.cancel);
router.post('/sessionBuilder/:id/sendSms', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.sendSms);
router.post('/sessionBuilder/:id/invite', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.inviteMembers);
router.delete('/sessionBuilder/:id/removeInvite/:inviteId', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.removeInvite);
router.delete('/sessionBuilder/:id/removeSessionMember/:sessionMemberId', PERMISSIONS.managerAdmin, sessionBuilder.removeSessionMember);
router.post('/sessionBuilder/:id/sendGenericEmail', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.sendGenericEmail);
router.get('/sessionBuilder/:id/sessionMailTemplateStatus', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.sessionMailTemplateStatus);
router.post('/sessionBuilder/:id/addTopics', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.addTopics);
router.post('/sessionBuilder/:id/removeTopic', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.removeTopic);

router.post('/sessionBuilder/:id/step/next', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.nextStep );
router.post('/sessionBuilder/:id/step/previous', PERMISSIONS.facilitatorManagerAdmin, sessionBuilder.prevStep);
