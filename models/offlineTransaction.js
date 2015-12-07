"use strict";

module.exports = (Sequelize, DataTypes) => {
  var OfflineTransaction = Sequelize.define('OfflineTransaction', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: { type: DataTypes.INTEGER, allowNull: false},
    sessionId:	{ type: DataTypes.INTEGER, allowNull: false},
    topicId:	{ type: DataTypes.INTEGER, allowNull: false},
    replyUserId:	{ type: DataTypes.INTEGER, allowNull: true},
    message_id:	{ type: DataTypes.INTEGER, allowNull: true},
    eventId: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'offline_transactions',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          OfflineTransaction.belongsTo(models.User, {foreignKey: 'userId'});
          OfflineTransaction.belongsTo(models.Topic, {foreignKey: 'topicId'});
          OfflineTransaction.belongsTo(models.Session, {foreignKey: 'sessionId'});
          // OfflineTransaction.belongsTo(models.ReplyUser, {foreignKey: 'replyUserId'});
          // OfflineTransaction.belongsTo(models.Message, {foreignKey: 'message_id'});
        }
      }
    }
)

  return OfflineTransaction;
};
