'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    accountId: { type: DataTypes.INTEGER, allowNull: false, unique: 'compositeAccountUserAndAccountId'},
    accountUserId: { type: DataTypes.INTEGER, allowNull: true , unique: 'compositeAccountUserAndAccountId'},
    userType: { type: DataTypes.ENUM, allowNull: false, values: ['existing', 'new'], defaultValue: 'existing' },
  }, {
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
        Invite.belongsTo(models.Account, { foreignKey: 'accountId', onDelete: 'cascade' });
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
