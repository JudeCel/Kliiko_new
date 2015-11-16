"use strict";

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false},
    userId: {type: DataTypes.INTEGER, allowNull: false},
    role: {type: DataTypes.ENUM, allowNull: false,
      values: ["admin", "accountManager", "facilitator", "observer", "participant"],
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
