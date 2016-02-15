"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Event = Sequelize.define('Event', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sessionMemberId:	{type: DataTypes.INTEGER, allowNull: false},
    topicId:	{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    replyId:	{type: DataTypes.INTEGER, allowNull: true},
    tag:	{ type: DataTypes.ENUM, allowNull: false, values: ['message', 'object'], defaultValue: 'message' },
    uid:	{type: DataTypes.STRING, allowNull: true},
    cmd:	{type: DataTypes.STRING, allowNull: true},
    event:	{ type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    thumbs_up:	{type: DataTypes.INTEGER, allowNull: true, defaultValue: 0}
  },
   {
      // indexes: [],
      tableName: 'Events',
      timestamps: true,
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Event.hasMany(models.Vote, {foreignKey: 'eventId'});
          Event.belongsTo(models.SessionMember, {foreignKey: 'sessionMemberId'});
        }
      }
    }
);
  return Event;
};
