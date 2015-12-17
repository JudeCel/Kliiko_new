"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Account = Sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: {args: true, msg: "already taken"},
      validate: { notEmpty: {args: true, msg: "can't be empty"},is: ["^[a-zA-Z0-9]+$",'i'] }
    }
  },{
      indexes: [
        { name: 'unique_name', unique: true, fields: [Sequelize.fn('lower', Sequelize.col('name'))] }
      ],
      classMethods: {
        associate: function(models) {
          Account.hasMany(models.AccountUser);
          Account.belongsToMany(models.User, { through: { model: models.AccountUser} } );
          Account.hasMany(models.Invite, { foreignKey: 'accountId' });
        }
      }
    }
);

  return Account;
};
