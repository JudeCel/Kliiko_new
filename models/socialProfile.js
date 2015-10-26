"use strict";
var bcrypt = require('bcrypt');
var User = require('./user').User;

module.exports = (Sequelize, DataTypes) => {
  var SocialProfile = Sequelize.define('SocialProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    provider: {type: DataTypes.ENUM, values: ['facebook', 'google'], allowNull: false},
    providerUserId: {type: DataTypes.STRING, allowNull: false},
    userId: {type: DataTypes.INTEGER, allowNull: false}
  },
   {indexes: [
      { name: 'SocialProfileProviderIndex',
        method: 'BTREE',
        fields: ['provider']
      }, {
        name: 'SocialProfileUserIndex',
        method: 'BTREE',
        fields: ['userId']
      }
   ]}
);
  // SocialProfile.belongsTo(User, {foreignKey: 'userId'});
  return SocialProfile;
};
