"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Topic = Sequelize.define('Topic', {
    id:	{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    session_id:	{ type: DataTypes.INTEGER, allowNull: false},
    topic_status_id: { type: DataTypes.INTEGER, allowNull: false, default: 1},
    topic_order_id: { type: DataTypes.INTEGER, allowNull: true},
    type: { type: DataTypes.STRING, allowNull: false, default: 'chat'},
    name:	{ type: DataTypes.STRING, allowNull: false},
    URL: { type: DataTypes.STRING, allowNull: true},
    description: { type: DataTypes.TEXT,},
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'topics',
      paranoid: true,
      classMethods: {
        associate: function(models) {
        }
      }
    }
);
  return Topic;
};
