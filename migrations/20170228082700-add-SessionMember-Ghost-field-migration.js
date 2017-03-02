'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError
let models = require("../models");
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeIndex('SessionMembers', 'UniqSessionMemberBySession').then(function() {
        queryInterface.changeColumn('SessionMembers', 'accountUserId', { type: Sequelize.INTEGER, allowNull: true }).then(function() {
          queryInterface.addColumn('SessionMembers', 'ghost', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }).then(function() {
            resolve();
          }, function(error) {
            validateError(error, resolve, reject);
          });
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
      queryInterface.changeColumn('SessionMembers', 'accountUserId', { type: Sequelize.INTEGER, allowNull: false }).then(function() {
        queryInterface.removeColumn('SessionMembers', 'ghost').then(function() {
          queryInterface.addIndex('SessionMembers',
            ['sessionId','accountUserId'], {
              indexName: 'UniqSessionMemberBySession',
              indicesType: 'UNIQUE'
          }).then(() => {
            resolve();
          }, (error) => {
            validateError(error, resolve, reject);
          });
        }, function(error) {
          validateError(error, resolve, reject);
        });
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  }
};