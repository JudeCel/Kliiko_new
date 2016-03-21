'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    ownerId: { type: DataTypes.INTEGER, allowNull: false },
    ownerType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'account' },
    accountUserId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM, allowNull: false, values: constants.inviteStatuses, defaultValue: 'pending' },
    userType: { type: DataTypes.ENUM, allowNull: false, values: ['existing', 'new'], defaultValue: 'existing' },
  }, {
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
        Invite.belongsTo(models.Account, { foreignKey: 'ownerId', onDelete: 'cascade' });
        Invite.belongsTo(models.Session, { foreignKey: 'ownerId', onDelete: 'cascade' });
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
