'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError;

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('Sessions', 'subscriptionId', { type: Sequelize.STRING, allowNull: true }).then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeColumn('Sessions', 'subscriptionId').then(function() {
        resolve();
      }, (error) => {
        validateError(error, resolve, reject);
      });
    });
  }
};
