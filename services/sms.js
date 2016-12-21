'use strict';
var { SubscriptionPreference, Subscription } = require('./../models');
const twilioLib = require('./../lib/twilio');
const _ = require('lodash');
const Bluebird = require('bluebird');
const MessagesUtil = require('./../util/messages')

module.exports = {
  send: send,
  validate: validate,
  calculateSmsCountParams: calculateSmsCountParams,
  buildErrorMessage: buildErrorMessage
};

function send(accountId, data, provider) {
  return new Bluebird((resolve, reject) => {
    Subscription.find({ where: { accountId: accountId }, include: [SubscriptionPreference] }).then((sp) => {
      let numbers = _.map(data.recievers, 'mobile');
      validate(numbers.length, sp.SubscriptionPreference.data).then(() => {
        twilioLib.sendSms(numbers, data.message, provider).then((result) => {
          updateSmsCount(sp.SubscriptionPreference, numbers.length).then(() => {
            resolve(result);
          }, (error) => {
            reject(error);
          })
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(error);
      });
    });
  });
}

function updateSmsCount(subscriptionPreference, decreaseNumber) {
  return new Bluebird((resolve, reject) => {

    let updateParams = calculateSmsCountParams(subscriptionPreference.data, decreaseNumber);
    subscriptionPreference.update(updateParams).then(() => {
      resolve();
    }, (error) => {
      reject(error);
    })
  });
}

function calculateSmsCountParams(data, decreaseNumber) {
  let planSmsCount = (data.planSmsCount || 0);
  let paidSmsCount = (data.paidSmsCount || 0);
  const subscriptionPreferenceParams = {}

  if (planSmsCount >= decreaseNumber) {
    subscriptionPreferenceParams['data.planSmsCount'] =  (planSmsCount - decreaseNumber);
  }

  if (planSmsCount < decreaseNumber) {
    subscriptionPreferenceParams['data.planSmsCount'] = 0;
    subscriptionPreferenceParams['data.paidSmsCount'] = (paidSmsCount - (decreaseNumber -planSmsCount));
  }
  return subscriptionPreferenceParams;
}

function validate(smsCount, data) {
  return new Bluebird((resolve, reject) => {
    let currentSmsCount = (data.planSmsCount + data.paidSmsCount);
    if (smsCount <= data.planSmsCount + data.paidSmsCount) {
      resolve();
    }else {
      reject(buildErrorMessage(smsCount, currentSmsCount));
    }
  });
}

function buildErrorMessage(smsCount, currentSmsCount) {
  let message = MessagesUtil.smsService.validation.faild
  message = message.replace("${smsCount}", smsCount);
  message = message.replace("${currentSmsCount}", currentSmsCount);
  return message;
}
