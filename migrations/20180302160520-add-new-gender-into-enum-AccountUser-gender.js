'use strict';
let Bluebird = require('bluebird');
let models = require('../models');
let constants = require('./../util/constants');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TYPE "enum_AccountUsers_gender" ADD VALUE \'neither\';');
  },
  down: function (queryInterface, Sequelize) {
    return models.AccountUser.update({ 'gender': '' }, { where: { 'gender': 'neither' } })
      .then(function () {
        return queryInterface.sequelize.query('DELETE FROM pg_enum WHERE enumlabel = \'neither\' AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = \'enum_AccountUsers_gender\');');
      });
  },
};
