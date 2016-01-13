"use strict";

module.exports = (Sequelize, DataTypes) => {
  var ContactListUser = Sequelize.define('ContactListUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    contactListId: {type: DataTypes.INTEGER, allowNull: false},
    customFields: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
  },{
      classMethods: {
        associate: function(models) {
          ContactListUser.belongsTo(models.User, {foreignKey: 'userId'});
          ContactListUser.belongsTo(models.ContactListUser, {foreignKey: 'contactListId'});
        }
      }
    }
);
  return ContactListUser;
};
