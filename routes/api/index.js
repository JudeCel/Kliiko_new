'use strict';
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
router.put('/accountDatabase/:accountUserId/comment', PERMISSIONS.admin, accountDatabase.updateAccountUserComment);

router.post('/banners', PERMISSIONS.admin, banners.create);
router.put('/banners', PERMISSIONS.admin, banners.update);

router.get('/mailTemplates', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.allMailTemplatesGet);
router.get('/sessionMailTemplates', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.allSessionMailTemplatesGet);
router.post('/mailTemplate', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.mailTemplatePost);
router.delete('/mailTemplate', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.deleteMailTemplate);
router.post('/mailTemplate/save', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.saveMailTemplatePost);
router.post('/mailTemplate/reset', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.resetMailTemplatePost);
router.post('/mailTemplate/preview', PERMISSIONS.facilitatorManagerAdmin, mailTemplates.previewMailTemplatePost);


router.get('/survey', PERMISSIONS.facilitatorManagerAdmin, survey.get);
router.delete('/survey', PERMISSIONS.facilitatorManagerAdmin, survey.remove);
router.post('/survey', PERMISSIONS.facilitatorManagerAdmin, survey.create);
router.put('/survey', PERMISSIONS.facilitatorManagerAdmin, survey.update);
router.post('/survey/copy', PERMISSIONS.facilitatorManagerAdmin, survey.copy);
router.put('/survey/status', PERMISSIONS.facilitatorManagerAdmin, survey.status);
router.get('/survey/find', survey.find);
router.post('/survey/answer', survey.answer);
router.put('/survey/confirm', PERMISSIONS.facilitatorManagerAdmin, survey.confirm);
router.get('/survey/constants', survey.getConstants);
router.get('/survey/canExportSurveyData', PERMISSIONS.facilitatorManagerAdmin, survey.canExportSurveyData);

// Subscription
router.get('/subscriptionPlan', PERMISSIONS.managerAdmin, subscription.getPlans);
router.put('/subscriptionPlan/updatePlan', PERMISSIONS.managerAdmin, subscription.updatePlan);
router.put('/subscriptionPlan/UpdateViaCheckout', PERMISSIONS.managerAdmin, subscription.retrievCheckoutAndUpdateSub)
router.post('/subscriptionPlan/postQuote', PERMISSIONS.managerAdmin, subscription.postQuote)

// Addons
router.get('/subscriptionSmsCredits', PERMISSIONS.managerAdmin, smsCredit.get);
router.post('/subscriptionSmsCredits/puchaseCredits', PERMISSIONS.managerAdmin, smsCredit.purchase);
router.get('/subscriptionSmsCredits/creditCount', PERMISSIONS.managerAdmin, smsCredit.creditCount);

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

router.get('/topics', PERMISSIONS.facilitatorManagerAdmin, topic.get);
router.post('/topic', PERMISSIONS.facilitatorManagerAdmin, topic.post);
router.put('/topic/updateSessionTopicName', PERMISSIONS.facilitatorManagerAdmin, topic.updateSessionTopicName);
router.put('/topic/:id', PERMISSIONS.facilitatorManagerAdmin, topic.updateById);
router.delete('/topic/:id', PERMISSIONS.facilitatorManagerAdmin, topic.deleteById);

router.get('/brandColour', PERMISSIONS.facilitatorManagerAdmin, brandColour.get);
router.delete('/brandColour', PERMISSIONS.facilitatorManagerAdmin, brandColour.remove);
router.post('/brandColour', PERMISSIONS.facilitatorManagerAdmin, brandColour.create);
router.put('/brandColour', PERMISSIONS.facilitatorManagerAdmin, brandColour.update);
router.post('/brandColour/copy', PERMISSIONS.facilitatorManagerAdmin, brandColour.copy);
router.get('/brandColour/canCreateCustomColors', PERMISSIONS.facilitatorManagerAdmin, brandColour.canCreateCustomColors);

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
