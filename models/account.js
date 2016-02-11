"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Account = Sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: {args: true, msg: 'Account name has already been taken'},
      validate: {
        notEmpty: true,
        is: constants.accountNameRegExp
      }
    }
  },{
      indexes: [
        { name: 'unique_name', unique: true, fields: [Sequelize.fn('lower', Sequelize.col('name'))] },
        { fields: [Sequelize.fn('lower', Sequelize.col('name'))] },
        { fields: ['id'] }
      ],
      classMethods: {
        associate: function(models) {
          Account.hasMany(models.AccountUser);
          Account.hasMany(models.Session, { foreignKey: 'accountId' });
          Account.hasMany(models.BrandProjectPreference, { foreignKey: 'accountId' });
          Account.belongsToMany(models.User, { through: { model: models.AccountUser} } );
          Account.hasMany(models.Invite, { foreignKey: 'accountId' });
          Account.hasMany(models.ContactList, { foreignKey: 'accountId' });
        }
      }
    }
);
  return Account;
};
