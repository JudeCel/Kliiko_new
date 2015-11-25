"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Event = Sequelize.define('Event', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id:	{type: DataTypes.INTEGER, allowNull: false},
    topic_id:	{type: DataTypes.INTEGER, allowNull: false, default: 0},
    reply_id:	{type: DataTypes.INTEGER, allowNull: true},
    cmd:	{type: DataTypes.STRING, allowNull: true},
    tag:	{type: DataTypes.INTEGER, allowNull: false, default: 0},
    uid:	{type: DataTypes.STRING, allowNull: true},
    event:	{type: DataTypes.TEXT, allowNull: true},
    timestamp: { type: DataTypes.INTEGER, allowNull: false}, // need remove
    thumbs_up:	{type: DataTypes.INTEGER, allowNull: true, default: 0}
  },
   {
      // indexes: [],
      tableName: 'events',
      timestamps: false,
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Event.hasMany(models.Vote, {foreignKey: 'event_id'})
        }
      }
    }
);
  return Event;
};
