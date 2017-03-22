'use strict';

const Bluebird = require('bluebird');
const models = require('./../models');
const constants = require('./../util/constants');

const currencies = constants.supportedCurrencies.join('|');
const regex = new RegExp(`_(${currencies})`);
const TO_CURRENCY = 'AUD';

module.exports = {
  update
};

function update() {
  return new Bluebird((resolve, reject) => {
    models.sequelize.transaction().then((transaction) => {
      let key = 'chargebeePlanId';
      models.SubscriptionPlan.findAll().then((plans) => {
        const promises = mapPromises(plans, key, planParams, transaction);
        return Promise.all(promises);
      }).then(() => {
        return models.Subscription.findAll();
      }).then((subs) => {
        const promises = mapPromises(subs, key, subParams, transaction);
        return Promise.all(promises);
      }).then(() => {
        transaction.commit();
      }).then(() => {
        resolve();
      }).catch((error) => {
        transaction.rollback().then(() => reject(error));
      });
    }).catch(reject);
  });
}

function updateables(array, key) {
  return array.filter((item) => !item[key].match(regex));
}

function mapPromises(array, key, paramFunc, transaction) {
  return updateables(array, key).map((item) => item.update(paramFunc(item), { transaction }));
}

function planParams(plan) {
  return { chargebeePlanId: `${plan.chargebeePlanId}_${TO_CURRENCY}`, preferenceName: plan.chargebeePlanId };
}

function subParams(sub) {
  return { planId: `${sub.planId}_${TO_CURRENCY}` };
}
