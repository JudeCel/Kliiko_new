"use strict";

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    comment: { type: DataTypes.TEXT, allowNull: true }
  }, {
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
