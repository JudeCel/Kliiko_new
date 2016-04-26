"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Message = Sequelize.define('Message', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sessionMemberId:	{type: DataTypes.INTEGER, allowNull: false},
    topicId:	{type: DataTypes.INTEGER, allowNull: false},
    replyId:	{type: DataTypes.INTEGER, allowNull: true},
    body:	{type: DataTypes.STRING, allowNull: false},
    star: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
  },
   {
      tableName: 'Messages',
      timestamps: true,
      classMethods: {
        associate: function(models) {
          Message.hasMany(models.Vote, {foreignKey: 'messageId'});
          Message.belongsTo(models.SessionMember, {foreignKey: 'sessionMemberId'});
        }
      }
    }
);
  return Message;
};
