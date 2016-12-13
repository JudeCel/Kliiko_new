'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError;
let models = require("../models");

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('Resources', 'source', { type: Sequelize.ENUM, allowNull: true, values: ['youtube', 'vimeo'] }).then(function(result) {
        models.Resource.update({ scope : "videoService", source: "youtube" }, { where: {scope: "youtube" } }).then(() =>{
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
      queryInterface.removeColumn('Resources', 'source').then(function(result) {
        models.Resource.update({ scope : "youtube" }, { where: {scope: "videoService" } }).then(() =>{
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
