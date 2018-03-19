'use strict';
let Bluebird = require('bluebird');
let models = require('../models');
let constants = require('./../util/constants');
let validateError = require('./helpers/errorFilter.js').validateError;

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.sequelize.query('ALTER TYPE "enum_AccountUsers_gender" ADD VALUE \'neither\';').then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    models.AccountUser.update({ 'gender': '' }, { where: { 'gender': 'neither' } }).then(function() {
      queryInterface.sequelize.query('DELETE FROM pg_enum WHERE enumlabel = \'neither\' AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = \'enum_AccountUsers_gender\');').then(function() {
        resolve();
      }, function(error) {
        validateError(error, resolve, reject);
      });
    }, function(error) {
      validateError(error, resolve, reject);
    });
  },
};
