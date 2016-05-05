"use strict";

module.exports = (Sequelize, DataTypes) => {
  var OfflineMessage = Sequelize.define('OfflineMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: {type: DataTypes.INTEGER, allowNull: false },
    messageId: { type: DataTypes.INTEGER, allowNull: true },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    scope: { type: DataTypes.ENUM, allowNull: false, values: ['replay', 'normal'], defaultValue: 'normal' },
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
        OfflineMessage.belongsTo(models.Topic, { foreignKey: 'topicId' });
        OfflineMessage.belongsTo(models.Message, { foreignKey: 'messageId' });
        OfflineMessage.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
      }
    }
  });

  return OfflineMessage;
};
