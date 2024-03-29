"use strict";

module.exports = (Sequelize, DataTypes) => {
  var UnreadMessage = Sequelize.define('UnreadMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: {type: DataTypes.INTEGER, allowNull: false },
    messageId: { type: DataTypes.INTEGER, allowNull: true },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    scope: { type: DataTypes.ENUM, allowNull: false, values: ['reply', 'normal'], defaultValue: 'normal' },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['messageId'] },
      { fields: ['sessionMemberId'] },
      { fields: ['sessionTopicId'] },
      { fields: ['scope'] }
    ],
    classMethods: {
      associate: function(models) {
        UnreadMessage.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade' });
        UnreadMessage.belongsTo(models.Message, { foreignKey: 'messageId', onDelete: 'cascade' });
        UnreadMessage.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId', onDelete: 'cascade' });
      }
    }
  });

  return UnreadMessage;
};
