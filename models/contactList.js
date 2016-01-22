"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var ContactList = Sequelize.define('ContactList', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    editable: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    defaultFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false,
      defaultValue: constants.contactListDefaultFields
    },
    visibleFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false,
      defaultValue: constants.contactListDefaultFields,
      editable: this.editable
    },
    customFields: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] }
  },{ indexes: [
        { unique: true,
          fields: ['name', 'accountId']
        }
      ],
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
