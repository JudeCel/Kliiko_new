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
    models.Subscription.findAll(where()).then((subscriptions) => {
      const updateables = subscriptions.filter((sub) => !sub.planId.match(regex));
      const promises = updateables.map((sub) => sub.update({ planId: `${sub.planId}_${TO_CURRENCY}` }));
      return Promise.all(promises);
    }).then(() => {
      resolve();
    }).catch(reject);
  });
}

function where() {
  return { where: { planId: { $notIn: ['free_trial', 'free_account'] } } };
}
