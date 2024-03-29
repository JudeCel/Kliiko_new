'use strict';

var validations = require('./validations');
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var SessionMember = Sequelize.define('SessionMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    accountUserId: { type: DataTypes.INTEGER, allowNull: true },
    token: { type: DataTypes.STRING, allowNull: true, validate: { isUnique: validations.unique(Sequelize, 'SessionMember', 'token') } },
    username: { type: DataTypes.STRING, allowNull: false },
    colour: { type: DataTypes.STRING, allowNull: false },
    avatarData: { type: DataTypes.JSONB, allowNull: false, defaultValue: constants.sessionMemberNoGender },
    sessionTopicContext: { type: DataTypes.JSONB, allowNull: false, defaultValue: { } },
    currentTopic: { type: DataTypes.JSONB, allowNull: false, defaultValue: { } },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.sessionMemberRoles },
    comment: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 5 } },
    closeEmailSent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    typeOfCreation: { type: DataTypes.ENUM, allowNull: false, values: ['system', 'invite'], defaultValue: 'invite'},
    ghost: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    device: { type: DataTypes.STRING, allowNull: true, defaultValue: null }
  }, {
    indexes: [
      { fields: ['sessionId'] },
      { fields: ['accountUserId'] },
      { fields: ['typeOfCreation'] },
      { fields: ['token'] }
    ],
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionMember.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        SessionMember.belongsTo(models.AccountUser, { foreignKey: 'accountUserId', onDelete: 'cascade' });
        SessionMember.hasMany(models.Shape, { foreignKey: 'sessionMemberId' });
        SessionMember.hasMany(models.Message, { foreignKey: 'sessionMemberId' });
        SessionMember.hasMany(models.MiniSurveyAnswer, { foreignKey: 'sessionMemberId' });
        SessionMember.hasMany(models.DirectMessage, { foreignKey: 'senderId', as: 'sent' });
        SessionMember.hasMany(models.DirectMessage, { foreignKey: 'recieverId', as: 'recieved' });
      }
    }
  });

  return SessionMember;
};
