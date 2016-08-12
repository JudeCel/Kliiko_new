"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Message = Sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: {type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    replyId: { type: DataTypes.INTEGER, allowNull: true },
    emotion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    body: { type: DataTypes.STRING, allowNull: false },
    star: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['sessionMemberId'] },
      { fields: ['sessionTopicId'] },
      { fields: ['replyId'] },
      { fields: ['star'] },
    ],
    classMethods: {
      associate: function(models) {
        Message.hasMany(models.Vote, { foreignKey: 'messageId' });
        Message.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId', onDelete: 'cascade' });
        Message.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade' });
      }
    }
  });

  return Message;
};
