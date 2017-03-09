'use strict';
const _ = require('lodash');
const plans = require('./plans');

const keys = Object.keys(plans);
const mand_keys = [
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
].sort();

keys.forEach((plan_key) => {
  const plan_keys = Object.keys(plans[plan_key]).sort();
  if(!_.isEqual(mand_keys, plan_keys)) {
    throw new Error(`"${plan_key}" keys doesn't match with mandatory, check them!`);
  }
});

module.exports = {
  free_trial:     plans.trial,
  free_account:   plans.account,
  senior_monthly: plans.senior,
  senior_yearly:  plans.senior,
  core_monthly:   plans.core,
  core_yearly:    plans.core,
  junior_monthly: plans.junior,
  junior_yearly:  plans.junior,
}
