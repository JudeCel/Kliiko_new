'use strict';

var validations = require('./validations');
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var SessionMember = Sequelize.define('SessionMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: {type: DataTypes.INTEGER, allowNull: false },
    accountUserId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: true, validate: {
      isUnique: validations.unique(Sequelize, 'SessionMember', 'token')
    } },
    username: { type: DataTypes.STRING, allowNull: false },
    colour: { type: DataTypes.STRING, allowNull: false },
    online: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    avatar_info: { type: DataTypes.STRING, allowNull: false, defaultValue: '0:3:0:0:0:0' },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.sessionMemberRoles },
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 5 } }
  }, {
    indexes: [ { fields: ['token'] } ],
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionMember.belongsTo(models.Session, { foreignKey: 'sessionId' });
        SessionMember.belongsTo(models.AccountUser, { foreignKey: 'accountUserId' });
        SessionMember.hasMany(models.Event, { foreignKey: 'sessionMemberId' });
      }
    }
  });

  return SessionMember;
};
