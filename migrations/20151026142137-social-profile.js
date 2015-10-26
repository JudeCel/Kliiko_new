'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('SocialProfiles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      provider: {type: Sequelize.INTEGER, allowNull: false},
      providerUserId: {type: Sequelize.STRING, allowNull: false},
      userId: {type: Sequelize.INTEGER, allowNull: false},
      createdAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW}
    },
    {
      charset: 'utf8'
    }
  )
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('SocialProfiles');
  }
};
