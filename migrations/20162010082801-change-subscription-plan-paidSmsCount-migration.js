'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.renameColumn('SubscriptionPlans', 'paidSmsCount', 'planSmsCount').then(function() {
        resolve();
      },function(error) {
        validateError(error, resolve, reject);
      });
    });
 },
 down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('SubscriptionPlan', 'planSmsCount',  'paidSmsCount').then(function() {
        resolve();
      },function(error) {
        validateError(error, resolve, reject);
      });
    });
  }
};
