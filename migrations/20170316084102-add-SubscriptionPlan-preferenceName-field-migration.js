'use strict';
const Bluebird = require('bluebird');
const validateError = require('./helpers/errorFilter.js').validateError
const validations = require('./../models/validations');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('SubscriptionPlans', 'preferenceName', { type: Sequelize.STRING, allowNull: false, defaultValue: '',
        validate: {
          notEmpty: true,
          isUnique: validations.unique(Sequelize, 'SubscriptionPlan', 'preferenceName')
        }
      }).then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('SubscriptionPlans', 'preferenceName');
  }
};
