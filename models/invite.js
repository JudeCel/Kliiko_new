'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    accountId: { type: DataTypes.INTEGER, allowNull: false},
    accountUserId: { type: DataTypes.INTEGER, allowNull: false},
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
        Invite.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
        Invite.belongsTo(models.Account, { foreignKey: 'accountId', onDelete: 'cascade' });
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
