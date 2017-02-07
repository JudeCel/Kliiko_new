const Bluebird = require('bluebird');

const models = require('../models');
const constants = require('../util/planConstants.js');

module.exports = {
  update
};

function update() {
  return new Bluebird((resolve, reject) => {
    models.SubscriptionPlan.findAll().then((plans) => {
      return Bluebird.each(plans, (plan) => plan.update(constants[plan.chargebeePlanId]))
    }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}
