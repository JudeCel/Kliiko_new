'use strict';

var MessagesUtil = require('./../util/messages');

module.exports = (Sequelize, DataTypes) => {
  var ContactListUser = Sequelize.define('ContactListUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountUserId: { type: DataTypes.INTEGER, allowNull: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    contactListId: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    customFields: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    unsubscribeToken: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
  }, {
    indexes: [{
      name: 'UniqEmailContactList',
      unique: { args: true, message: MessagesUtil.models.accountUser.email },
      fields: [ 'userId','accountUserId', 'contactListId', 'accountId']
    }],
    classMethods: {
      associate: function(models) {
        ContactListUser.belongsTo(models.AccountUser, { foreignKey: 'accountUserId' });
        ContactListUser.belongsTo(models.User, { foreignKey: 'userId' });
        ContactListUser.belongsTo(models.Account, { foreignKey: 'accountId' });
        ContactListUser.belongsTo(models.ContactList, { foreignKey: 'contactListId' });
      }
    }
  });

  return ContactListUser;
};
