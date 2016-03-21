'use strict';
var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Account = Sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: true,
        is: constants.accountNameRegExp,
        isUnique: validations.unique(Sequelize, 'Account', 'name', { lower: true })
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
          //TODo fix owner Type
          Account.hasMany(models.Invite, { foreignKey: 'ownerId', scope: { ownerType: 'account' } });
          Account.hasMany(models.ContactList, { foreignKey: 'accountId' });
          Account.hasOne(models.Subscription, { foreignKey: 'accountId' });
        }
      }
    }
);
  return Account;
};
