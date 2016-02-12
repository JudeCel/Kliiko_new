'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    accountId: { type: DataTypes.INTEGER, allowNull: false, unique: 'compositeaccountUserIdAndaccountId'},
    accountUserId: { type: DataTypes.INTEGER, allowNull: false , unique: 'compositeaccountUserAndaccountId'},
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
