'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('BrandProjectPreferences', 'type', { type: DataTypes.ENUM, allowNull: false, values: ['focus', 'forum'], defaultValue: 'focus' })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('BrandProjectPreferences', 'type')
  }
};

