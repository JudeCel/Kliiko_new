'use strict';
var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Account = Sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    selectedPlanOnRegistration: {type: DataTypes.STRING, allowNull: true },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    subdomain: {type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false,
      set: function(val) {
        this.setDataValue('name', val)
        if (val) {
          this.setDataValue('subdomain', val.replace(/ /g,'').toLowerCase())
        }
      },
      validate: {
        notEmpty: true,
        is: constants.accountNameRegExp,
        isUnique: validations.unique(Sequelize, 'Account', 'name', { lower: true }),
        isLength: validations.length('accountName', { max: 20 })
      }
    }
  },{
      indexes: [
        { name: 'accounts_unique_name', unique: true, fields: ['subdomain']},
        { fields: ['subdomain'] },
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
          Account.hasOne(models.Subscription, { foreignKey: 'accountId' });
        }
      }
    }
);
  return Account;
};
