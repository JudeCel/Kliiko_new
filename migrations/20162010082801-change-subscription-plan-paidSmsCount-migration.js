'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: (queryInterface, Sequelize) => {
    return new Bluebird((resolve, reject) => {
      queryInterface.renameColumn('SubscriptionPlans', 'paidSmsCount', 'planSmsCount').then(() => {
        resolve(queryInterface.changeColumn('SubscriptionPlans', 'planSmsCount', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }));
      },(error) => {
        validateError(error, resolve, reject);
      });
    });
 },
 down: (queryInterface, Sequelize) => {
    return new Bluebird((resolve, reject) => {
      queryInterface.renameColumn('SubscriptionPlans', 'planSmsCount',  'paidSmsCount').then(() => {
        resolve();
      }, (error) => {
        validateError(error, resolve, reject);
      });
    });
  }
};
