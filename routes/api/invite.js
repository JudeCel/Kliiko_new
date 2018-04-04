'use strict';

var constants = require('../../util/constants');
var sessionServices = require('./../../services/session');

module.exports = {
  getLatestGuestInvitationHistory: getLatestGuestInvitationHistory,
  getGuestInvitationHistories: getGuestInvitationHistories
};

function getLatestGuestInvitationHistory(req, res, next) {
  let userId = req.currentResources.user.id;
  /*sessionServices.findLatestSocialForumSession(userId).then((result) => {
    res.send(result);
  }, (error) => {
    res.status(500).send();
  });*/
  
  //todo:
  res.status(500).send();
}

function getGuestInvitationHistories(req, res, next) {
  let userId = req.currentResources.user.id;
  /*sessionServices.findAllSoccialForumSessions(userId).then((result) => {
    res.send(result);
  }, (error) => {
    res.status(500).send();
  });*/
  
  //todo:
  res.status(500).send();
}

