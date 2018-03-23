'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError;
let models = require('../models');
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('SubscriptionPlans', 'brandLogoAndCustomColors', { type: 'INTEGER USING CAST("brandLogoAndCustomColors" as INTEGER)' })
        .then(function () {
          resolve();
        }, function (error) {
          validateError(error, resolve, reject);
        });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('SubscriptionPlans', 'brandLogoAndCustomColors', { type: 'BOOLEAN USING CAST("brandLogoAndCustomColors" as BOOLEAN)' })
        .then(function () {
          resolve();
        }, function (error) {
          validateError(error, resolve, reject);
        });
    });
  },
};
