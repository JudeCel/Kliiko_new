"use strict";

module.exports = (Sequelize, DataTypes) => {
  var OfflineTransaction = Sequelize.define('OfflineTransaction', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: { type: DataTypes.INTEGER, allowNull: false},
    session_id:	{ type: DataTypes.INTEGER, allowNull: false},
    topic_id:	{ type: DataTypes.INTEGER, allowNull: false},
    reply_user_id:	{ type: DataTypes.INTEGER, allowNull: true},
    message_id:	{ type: DataTypes.INTEGER, allowNull: true},

    event_id: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, default: 0},
    created:	{ type: DataTypes.DATE},// need remove
    updated:	{ type: DataTypes.DATE},// need remove
    deleted:	{ type: DataTypes.DATE}// need remove
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'offline_transactions',
      // paranoid: true,
      classMethods: {
        associate: function(models) {
          OfflineTransaction.belongsTo(models.User, {foreignKey: 'user_id'});
          OfflineTransaction.belongsTo(models.Topic, {foreignKey: 'topic_id'});
          OfflineTransaction.belongsTo(models.Session, {foreignKey: 'session_id'});
          // OfflineTransaction.belongsTo(models.ReplyUser, {foreignKey: 'reply_user_id'});
          // OfflineTransaction.belongsTo(models.Message, {foreignKey: 'message_id'});
        }
      }
    }
)

  return OfflineTransaction;
};
