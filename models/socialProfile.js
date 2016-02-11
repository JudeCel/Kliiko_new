'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SocialProfile = Sequelize.define('SocialProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    provider: { type: DataTypes.ENUM, values: ['facebook', 'google'], allowNull: false },
    providerUserId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    indexes: [{
      unique: true,
      fields: ['provider', 'providerUserId']
    }, {
      name: 'SocialProfileProviderIndex',
      method: 'BTREE',
      fields: ['provider']
    }, {
      name: 'SocialProfileUserIndex',
      method: 'BTREE',
      fields: ['userId']
    }],
    classMethods: {
      associate: function(models) {
        SocialProfile.belongsTo(models.User, { foreignKey: 'userId' });
      }
    }
  });

  return SocialProfile;
};
