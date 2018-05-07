'use strict';
const _ = require('lodash');
const plans = require('./plans');
const constants = require('./constants');
const moment = require('moment');

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

/**
 * @param {string} planId
 * @return {string} name of plan
 */
function planName(planId) {
  let planPeriods = constants.supportedPlanPeriods.join('|').toLowerCase();
  let supportedCurrencies = constants.supportedCurrencies.join('|').toLowerCase();
  let planName = planId.replace(new RegExp(`(_(${planPeriods})|_(${supportedCurrencies}))`, 'gi'), '');
  return _.capitalize(_.lowerCase(planName));
}

/**
 * @param {Subscription} subscription
 * @param {Session} session
 * @return {{string:planId, date:endDate}|null}
 */
function planNameBySubId(subscription, session) {
  let plans = availablePlans(subscription, session)
  let resource = plans.find((p) => p.subscriptionId === session.subscriptionId);
  if (!resource) {
    return null;
  }
  return { planId: resource.planId, endDate: resource.endDate };
}

/**
 * List of all the bought, not expired and not used sessions
 * @param {Subscription} subscription
 * @param {Session} [currentSession]
 * @return {array<{string:planId,string:subscriptionId,date:endDate}>}
 */
function availablePlans(subscription, currentSession) {
  let fromSessions = _.get(subscription, 'SubscriptionPreference.data.availableSessions', []);
  return _.filter(_.clone(fromSessions), (p) => (!p.sessionId || currentSession && p.sessionId === currentSession.id) && moment().isBefore(p.endDate));
}

/**
 * List of all the bought and not expired sessions (both used and not used)
 * @param {Subscription} subscription
 * @param {SubscriptionPreference} subscription.SubscriptionPreference
 * @return {array<{string:planId,string:subscriptionId,date:endDate}>}
 */
function boughtPlans(subscription) {
  let fromSessions = _.get(subscription, 'SubscriptionPreference.data.availableSessions', []);
  return _.filter(_.clone(fromSessions), (p) => moment().isBefore(p.endDate));
}

/**
 * @param {Subscription} subscription
 * @param {SubscriptionPreference} subscription.SubscriptionPreference
 * @return {number}
 */
function sessionCount(subscription) {
  let plans = boughtPlans(subscription);
  if (plans.find((p) => p.sessionCount === -1)) {
    return -1;
  }
  return plans.length;
}

module.exports = {
  // active plans
  free_trial:     plans.trial,
  free_account:   plans.account,
  starter_monthly:  plans.starter,
  starter_annual: plans.starter_annual,
  essentials_monthly:  plans.essentials,
  essentials_annual: plans.essentials_annual,
  pro_monthly:  plans.pro,
  pro_annual: plans.pro_annual,

  // inactive plans
  senior_monthly: plans.senior,
  senior_yearly:  plans.senior,
  core_monthly:   plans.core,
  core_yearly:    plans.core,
  junior_monthly: plans.junior,
  junior_yearly:  plans.junior,
  preferenceName,
  planName,
  planNameBySubId,
  availablePlans,
  sessionCount,
  TRIAL_PLAN_NAME: 'free_trial',
  DEFAULT_PLAN_NAME: 'essentials_monthly',
};
