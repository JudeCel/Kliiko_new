'use strict';

const models = require('../models');
const subscriptionService = require('../services/subscription');
const Bluebird = require('bluebird');

module.exports = {
  updateSubscriptionsEndDate: updateSubscriptionsEndDate
};

function updateSubscriptionsEndDate() {
  return new Bluebird((resolve, reject) => {
    models.Subscription.findAll({ where: { endDate: null } }).then((subscriptions) => {
      return Bluebird.each(subscriptions, (subscription) => {
        return updateSubscriptionEndDate(subscription);
      });
    }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

function updateSubscriptionEndDate(subscription) {
  return new Bluebird((resolveItem, rejectItem) => {
    subscriptionService.getChargebeeSubscription(subscription.subscriptionId).then((chargebeeSubscription) => {
      let endDate = subscriptionService.getSubscriptionEndDate(chargebeeSubscription);
      models.Subscription.update({ endDate: endDate }, { where: { id: subscription.id } }).then(() => {
        resolveItem();
      }, (error) => {
        console.log(subscription.id, error);
        resolveItem();
      });
    }, (error) => {
      console.log(subscription.id, error);
      resolveItem();
    });
  });
}
