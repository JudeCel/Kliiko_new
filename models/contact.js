"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Contact = Sequelize.define('Contact', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false}
  },{
      classMethods: {
        associate: function(models) {
          Contact.belongsTo(models.Account, {foreignKey: 'accountId'});
        }
      }
    }
);

  return Contact;
};
