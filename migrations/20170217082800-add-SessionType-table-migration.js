'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError
let models = require("../models");
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('Sessions', 'type', { type: Sequelize.STRING }).then(function() {
        queryInterface.createTable('SessionTypes', {
          name: { type: Sequelize.STRING, primaryKey: true },
          properties: { type: Sequelize.JSONB, allowNull: false },
          createdAt: Sequelize.DATE,
          updatedAt: Sequelize.DATE
        }).then(() => {
          sessionTypeService.updateSessionTypes().then(function() {
            queryInterface.changeColumn('Sessions', 'type', {
              type: Sequelize.STRING,
              references: { model: "SessionTypes", key: "name" }
            }).then(function() {
              resolve();
            }, function(error) {
              validateError(error, resolve, reject);
            });
          }, function(error) {
            validateError(error, resolve, reject);
          });
        }, (error) => {
          validateError(error, resolve, reject);
        });
      },function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      reject("Should newer do this");
    });
  }
};