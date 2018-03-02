'use strict';
let Bluebird = require('bluebird');
let constants = require('./../util/constants');

module.exports = {
  up  : function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TYPE \"enum_AccountUsers_gender\" ADD VALUE 'neither';");
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DELETE FROM pg_enum WHERE enumlabel = \'neither\' AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = \'ENUM_ACCOUNTUSERS_GENDER\')');
  }
};
