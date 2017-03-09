'use strict';
const Bluebird = require('bluebird');

const models = require('../models');
const constants = require('../util/planConstants.js');

module.exports = {
  update,
  private: {
    assign
  }
};

function update() {
  return new Bluebird((resolve, reject) => {
    models.SubscriptionPreference.findAll({ include: [models.Subscription] }).then((preferences) => {
      return Bluebird.each(preferences, (preference) => {
        const planId = preference.Subscription.planId;
        const data = assign(constants[planId], preference.data);
        return preference.update({ data });
      });
    }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}

function assign(plan, preference) {
  return Object.assign({}, plan, preference);
}
