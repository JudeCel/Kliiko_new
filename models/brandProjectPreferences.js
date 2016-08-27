'use strict';

var brandProjectConstants = require('../util/brandProjectConstants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var BrandProjectPreference = Sequelize.define('BrandProjectPreference', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:	{ type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: true,
        isUnique: validations.unique(Sequelize, 'BrandProjectPreference', 'name', { accountContext: true }),
        isLength: validations.length('name', { max: 255 })
      }
    },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    colours: { type: DataTypes.JSONB, allowNull: false, defaultValue: brandProjectConstants.preferenceColours },
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        BrandProjectPreference.belongsTo(models.Account, { foreignKey: 'accountId' });
        BrandProjectPreference.hasOne(models.Session, { foreignKey: 'brandProjectPreferenceId' });
      }
    }
  });

  return BrandProjectPreference;
};
