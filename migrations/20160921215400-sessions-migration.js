'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Sessions', 'type', { type: DataTypes.ENUM, values: ['focus', 'forum'] })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Sessions', 'type')
  }
};

