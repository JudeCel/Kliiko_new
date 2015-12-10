'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    userType: { type: DataTypes.ENUM, allowNull: false, values: ['existing', 'new'], defaultValue: 'existing' },
    // sessionId: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
        Invite.belongsTo(models.Account, { foreignKey: 'accountId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
