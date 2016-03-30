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
    accountId: { type: DataTypes.INTEGER, allowNull: true},
    userType: { type: DataTypes.ENUM, allowNull: false, values: ['existing', 'new'], defaultValue: 'existing' },
  }, {
    indexes: [
      { name: "UniqInvite",
        unique: {args: true, message: "User has already been invited."},
        fields: ['accountUserId', 'accountId']
      }
    ],
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.User, { foreignKey: 'userId' });
        Invite.belongsTo(models.Account, { foreignKey: 'ownerId' });
        Invite.belongsTo(models.Session, { foreignKey: 'ownerId', onDelete: 'cascade' });
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
