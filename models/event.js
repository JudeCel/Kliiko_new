"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Event = Sequelize.define('Event', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId:	{type: DataTypes.INTEGER, allowNull: false},
    topicId:	{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    replyId:	{type: DataTypes.INTEGER, allowNull: true},
    cmd:	{type: DataTypes.STRING, allowNull: true},
    tag:	{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    uid:	{type: DataTypes.STRING, allowNull: true},
    event:	{type: DataTypes.TEXT, allowNull: true},
    timestamp: { type: DataTypes.INTEGER, allowNull: false}, // need remove
    thumbs_up:	{type: DataTypes.INTEGER, allowNull: true, defaultValue: 0}
  },
   {
      // indexes: [],
      tableName: 'events',
      timestamps: true,
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Event.hasMany(models.Vote, {foreignKey: 'eventId'})
          Event.belongsTo(models.User, {foreignKey: 'userId'})
        }
      }
    }
);
  return Event;
};
