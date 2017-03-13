'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('Topics', 'inviteAgain', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }).then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeColumn('Topics', 'inviteAgain').then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  }
};