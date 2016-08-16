'use strict';

var _ = require('lodash');

module.exports = {
  addShowStatus: addShowStatus,
};

function addShowStatus(session, chargebeeSub) {
  let endDate;
  if(chargebeeSub) {
    endDate = new Date((chargebeeSub.current_term_end || chargebeeSub.trial_end) * 1000);
  }

  let settings = session.dataValues || session;
  settings.expireDate = endDate;
  settings.showStatus = _.capitalize(session.status);

  // if(session.status == "") {
  //   var date = new Date();
  //   if((chargebeeSub && date > endDate) || date > new Date(session.endTime)) {
  //     settings.showStatus = 'Expired';
  //   }
  //   else if(date < new Date(session.startTime)) {
  //     settings.showStatus = 'Pending';
  //   }
  //   else {
  //     settings.showStatus = 'Open';
  //   }
  // }
  // else {
  //   settings.showStatus = 'Closed';
  // }
}
