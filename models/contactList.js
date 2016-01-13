"use strict";

module.exports = (Sequelize, DataTypes) => {
  var ContactList = Sequelize.define('ContactList', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    defaultFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false,
      defaultValue: ["firstName", "lastName", "gender","email"]
    },
    customFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] }
  },{
      classMethods: {
        associate: function(models) {
          ContactList.belongsTo(models.Account, {foreignKey: 'accountId'});
          ContactList.hasMany(models.ContactListUser, {foreignKey: 'contactListId'});
        }
      }
    }
);

  return ContactList;
};
