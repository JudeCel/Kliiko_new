'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError
let models = require("../models");
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('Surveys', 'description', { type: Sequelize.TEXT, allowNull: false }).then(function() {
        queryInterface.changeColumn('Surveys', 'thanks', { type: Sequelize.TEXT, allowNull: false }).then(function() {
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
      queryInterface.changeColumn('Surveys', 'description', { type: Sequelize.STRING, allowNull: false }).then(function() {
        queryInterface.changeColumn('Surveys', 'thanks', { type: Sequelize.STRING, allowNull: false }).then(function() {
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