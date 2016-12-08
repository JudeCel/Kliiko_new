'use strict';

var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var ContactList = Sequelize.define('ContactList', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, validate: { isUnique: validations.unique(Sequelize, 'ContactList', 'name', { accountContext: true }) } },
    editable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles, defaultValue: 'participant' },
    defaultFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: constants.contactListDefaultFields },
    visibleFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: constants.contactListDefaultFields },
    participantsFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false,
      defaultValue: [ 'Invites', 'Accept', 'NotThisTime', 'NotAtAll', 'NoReply', 'Future', 'LastSession', 'Comments']
    },
    customFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] }
  }, {
    classMethods: {
      associate: function(models) {
        ContactList.belongsTo(models.Account, { foreignKey: 'accountId' });
        ContactList.hasMany(models.ContactListUser, { foreignKey: 'contactListId' });
      }
    }
  });

  return ContactList;
};
