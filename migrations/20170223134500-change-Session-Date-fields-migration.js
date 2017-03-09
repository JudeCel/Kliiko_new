'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError
let models = require("../models");
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('Sessions', 'startTime', { type: Sequelize.DATE, allowNull: true }).then(function() {
        queryInterface.changeColumn('Sessions', 'endTime', { type: Sequelize.DATE, allowNull: true }).then(function() {
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
      queryInterface.changeColumn('Sessions', 'startTime', { type: Sequelize.DATE, allowNull: false }).then(function() {
        queryInterface.changeColumn('Sessions', 'endTime', { type: Sequelize.DATE, allowNull: false }).then(function() {
          resolve();
        }, function(error) {
          validateError(error, resolve, reject);
        });
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  }
};