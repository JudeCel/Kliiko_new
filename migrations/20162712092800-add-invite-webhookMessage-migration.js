'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: (queryInterface, Sequelize) => {
    return new Bluebird((resolve, reject) => {
      queryInterface.addColumn('Invites', 'webhookMessage',{ type : Sequelize.STRING, allowNull: true}).then(() => {
        resolve();
      }, (error) => {
        validateError(error, resolve, reject);
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Invites', 'webhookMessage');
  }
};
