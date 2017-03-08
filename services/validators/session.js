'use strict';

var _ = require('lodash');
var sessionTypesConstants = require('./../../util/sessionTypesConstants');

module.exports = {
  addShowStatus: addShowStatus,
};

function addShowStatus(session, subscriptionEndDate) {
  let settings = session.dataValues || session;
  settings.expireDate = subscriptionEndDate;
  let type = session.steps ? session.steps.step1.type : session.type;

  if (session.status == "open") {
    if (!type) {
      settings.showStatus = 'Expired';
    } else if (sessionTypesConstants[type].features.dateAndTime.enabled) {
      var date = new Date();
      if (date < new Date(session.startTime) || session.isInactive) {
        settings.showStatus = 'Pending';
      } else if((subscriptionEndDate && date > subscriptionEndDate) || date > new Date(session.endTime)) {
        settings.showStatus = 'Expired';
      } else {
        settings.showStatus = 'Open';
      }
    } else if (sessionTypesConstants[type].features.publish.enabled) {
      if (session.publicUid) {
        settings.showStatus = 'Open';
      } else {
        settings.showStatus = 'Unpublished';
      }
    } else {
      settings.showStatus = 'Open';
    }
  } else {
    settings.showStatus = 'Closed';
  }
}