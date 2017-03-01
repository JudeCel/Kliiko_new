'use strict';

var _ = require('lodash');
var sessionTypesConstants = require('./../../util/sessionTypesConstants');

module.exports = {
  addShowStatus: addShowStatus,
};

function addShowStatus(session, chargebeeSub) {
  let endDate;
  if (chargebeeSub) {
    endDate = new Date((chargebeeSub.current_term_end || chargebeeSub.trial_end) * 1000);
  }

  let settings = session.dataValues || session;
  settings.expireDate = endDate;
  let type = session.steps ? session.steps.step1.type : session.type;

  if (session.status == "open") {
    if (!type) {
      settings.showStatus = 'Expired';
    } else if (sessionTypesConstants[type].features.dateAndTime.enabled) {
      var date = new Date();
      if (date < new Date(session.startTime) || session.isInactive) {
        settings.showStatus = 'Pending';
      } else if((chargebeeSub && date > endDate) || date > new Date(session.endTime)) {
        settings.showStatus = 'Expired';
      } else {
        settings.showStatus = 'Open';
      }
    } else {
      settings.showStatus = 'Open';
    }
  } else {
    settings.showStatus = 'Closed';
  }
}