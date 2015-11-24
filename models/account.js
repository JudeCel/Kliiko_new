"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Account = Sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: {args: true, msg: "already taken"},
      validate: { notEmpty: {args: true, msg: "can't be empty"},is: ["^[a-zA-Z0-9]+$",'i'] }
    }
  },{
      classMethods: {
        associate: function(models) {
          Account.belongsToMany(models.User, { through: models.AccountUser, foreignKey: 'userId' });
          Account.hasMany(models.AccountUser, { foreignKey: 'userId' });
        }
      }
    }
);

  return Account;
};