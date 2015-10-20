'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      promo_code: {type: Sequelize.INTEGER, allowNull: true},
      reset_password_token: {type : Sequelize.INTEGER, allowNull: true},
      reset_password_sent_at: {type : Sequelize.DATE, allowNull: true},
      current_sign_in_ip: {type : Sequelize.STRING, allowNull: true},
      first_name: {type: Sequelize.INTEGER, allowNull: false},
      last_name: {type: Sequelize.INTEGER, allowNull: false},
      email: {type: Sequelize.STRING, allowNull: false, unique: true},
      encrypted_password:  {type : Sequelize.STRING, allowNull: false},
      created_at: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},

      },
    {
      charset: 'utf8'
    }
  )
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
