'use strict';

let Bluebird = require('bluebird');
var { Session, Account, Subscription, ContactList, SubscriptionPreference } = require('./../../models');
var _ = require('lodash');
var sessionTypesConstants = require('./../../util/sessionTypesConstants');

module.exports = {
  addShowStatus: addShowStatus,
  canOpenSession: canOpenSession
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

function canOpenSession(sessionId, accountId, status) {
  return new Bluebird((resolve, reject) => {
    Session.find({
      where: {
        id: sessionId,
        accountId: accountId
      },
      include: [{
        model: Account,
        include: [{
          model: Subscription,
          include: [{
            model: SubscriptionPreference
          }]
        }]
      }]
    }).then(function(session) {
      let preferences = session.Account.Subscription.SubscriptionPreference;
      let validCount = preferences.data.contactListCount + 4;

      if (preferences.data.contactListCount == -1) { resolve() };

      ContactList.count({
        where: {
          accountId: accountId
        }
      }).then(function(count){
        if( session.type == "socialForum" && validCount <= count && status == "closed") {
          let message = "Please upgrade your Plan. You can only have " + preferences.data.contactListCount + " Open Social OR Survey Recruiter on Your Plan";
          reject(message);
        } else {
          resolve();
        }
      });
    })
  });
}
