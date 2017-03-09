'use strict';
const Bluebird = require('bluebird');
const validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('BrandProjectPreferences', 'default', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }).then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('BrandProjectPreferences', 'default');
  }
};
