'use strict';
const Bluebird = require('bluebird');
const validateError = require('./helpers/errorFilter.js').validateError;

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('SubscriptionPlans', 'zapierGuestInvitationHistory', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false })
      .then(function() {
          queryInterface.sequelize.query('ALTER TYPE "enum_ZapierSubscriptions_event" ADD VALUE \'guest_invitation_history\';').then(function() {
            resolve();
          }, function(error) {
            validateError(error, resolve, reject);
          });
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeColumn('SubscriptionPlans', 'zapierGuestInvitationHistory').then(function() {
        resolve();
      }, (error) => {
        validateError(error, resolve, reject);
      });
    });
  }
};
