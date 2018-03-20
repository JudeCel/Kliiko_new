'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError;
let models = require("../models");

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('SessionMembers', 'device', { type: Sequelize.STRING, allowNull: true, defaultValue: null }).then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeColumn('SessionMembers', 'device').then(function() {
        resolve();
      }, (error) => {
        validateError(error, resolve, reject);
      });
    });
  }
};