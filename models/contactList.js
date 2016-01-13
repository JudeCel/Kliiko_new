"use strict";

module.exports = (Sequelize, DataTypes) => {
  var ContactList = Sequelize.define('ContactList', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false}
  },{
      classMethods: {
        associate: function(models) {
          ContactList.belongsTo(models.Account, {foreignKey: 'accountId'});
        }
      }
    }
);

  return ContactList;
};
