"use strict";

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER},
    userId: {type: DataTypes.INTEGER},
    rools: {type: DataTypes.ENUM,
      values: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'],
    allowNull: false
  }
  },{
      classMethods: {
        associate: function(models) {
          AccountUser.belongsTo(models.User, {foreignKey: 'userId'});
          AccountUser.belongsTo(models.Account, {foreignKey: 'accountId'});
        }
      }
    }
);

  return AccountUser;
};
