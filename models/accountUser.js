"use strict";

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    owner: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    role: {type: DataTypes.ENUM, allowNull: false,
      values: ["admin", "accountManager", "facilitator", "observer", "participant"],
    }
  },{
      classMethods: {
        associate: function(models) {
          AccountUser.belongsTo(models.User);
          AccountUser.belongsTo(models.Account);
        }
      }
    }
);

  return AccountUser;
};
