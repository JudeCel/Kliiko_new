'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    accountUserId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM, allowNull: false, values: constants.inviteStatuses, defaultValue: 'pending' },
    emailStatus: { type: DataTypes.ENUM, allowNull: false, values: constants.inviteEmailStatuses, defaultValue: 'waiting' },
    mailProvider: { type: DataTypes.ENUM, allowNull: true, values: ["mailgun"], defaultValue: 'mailgun' },
    mailMessageId: { type : DataTypes.STRING, allowNull: true},
    webhookMessage: { type : DataTypes.STRING, allowNull: true},
    webhookEvent: { type : DataTypes.STRING, allowNull: true},
    webhookTime: { type : DataTypes.DATE, allowNull: true}
  }, {
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
        Invite.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        Invite.belongsTo(models.Account, { foreignKey: 'accountId', onDelete: 'cascade' });
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
      }
    }
  });

  return Invite;
};
