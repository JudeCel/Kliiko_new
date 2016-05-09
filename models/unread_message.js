"use strict";

module.exports = (Sequelize, DataTypes) => {
  var UnreadMessage = Sequelize.define('UnreadMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: {type: DataTypes.INTEGER, allowNull: false },
    messageId: { type: DataTypes.INTEGER, allowNull: true },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    scope: { type: DataTypes.ENUM, allowNull: false, values: ['reply', 'normal'], defaultValue: 'normal' },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['messageId'] },
      { fields: ['sessionMemberId'] },
      { fields: ['topicId'] },
      { fields: ['scope'] }
    ],
    classMethods: {
      associate: function(models) {
        UnreadMessage.belongsTo(models.Topic, { foreignKey: 'topicId' });
        UnreadMessage.belongsTo(models.Message, { foreignKey: 'messageId' });
        UnreadMessage.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
      }
    }
  });

  return UnreadMessage;
};
