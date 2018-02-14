'use strict';
const _ = require('lodash');
const plans = require('./plans');
const constants = require('./constants');

const keys = Object.keys(plans);
const mand_keys = [
  "handsOnHelp",
  "sessionCount",
  "contactListCount",
  "recruiterContactListCount",
  "importDatabase",
  "brandLogoAndCustomColors",
  "contactListMemberCount",
  "accountUserCount",
  "exportContactListAndParticipantHistory",
  "exportRecruiterStats",
  "exportRecruiterSurveyData",
  "accessKlzziForum",
  "accessKlzziFocus",
  "accessKlzziSocialForum",
  "canInviteObserversToSession",
  "paidSmsCount",
  "planSmsCount",
  "canBuySms",
  "discussionGuideTips",
  "whiteboardDisplay",
  "whiteboardFunctionality",
  "uploadToGallery",
  "reportingFunctions",
  "pinboardDisplay",
  "voting",
  "privateMessaging",
  "numberOfContacts",
  "availableOnTabletAndMobilePlatforms",
  "customEmailInvitationAndReminderMessages",
  "topicCount",
  "priority",
  "surveyCount",
  "secureSsl",
  "monthToUseChatSessions",
  "unlimitedTopicChanges",
  "recruitNewContactList",
  "accessThreeChatRooms",
].sort();

keys.forEach((plan_key) => {
  const plan_keys = Object.keys(plans[plan_key]).sort();
  if(!_.isEqual(mand_keys, plan_keys)) {
    throw new Error(`"${plan_key}" keys doesn't match with mandatory, check them!`);
  }
});

/**
 * Prepare "preference" based on ChargeBee planId
 * @param {string} chargebeePlanId
 */
function preferenceName(chargebeePlanId) {
  const currencies = constants.supportedCurrencies.join('|');
  return chargebeePlanId.replace(new RegExp(`[_-](${currencies})`, 'i'), '');
}

module.exports = {
  // active plans
  //TODO: TA2061 yearly plans
  free_trial:     plans.trial,
  free_account:   plans.account,
  starter_monthly:  plans.starter,
  // starter_annual:
  essentials_monthly:  plans.essentials,
  // essentials_annual:
  pro_monthly:  plans.pro,
  // pro_annual:

  // inactive plans
  senior_monthly: plans.senior,
  senior_yearly:  plans.senior,
  core_monthly:   plans.core,
  core_yearly:    plans.core,
  junior_monthly: plans.junior,
  junior_yearly:  plans.junior,
  preferenceName
};
