"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Topic = Sequelize.define('Topic', {
    id:	{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId:	{ type: DataTypes.INTEGER, allowNull: false},
    topic_status_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    topic_order_id: { type: DataTypes.INTEGER, allowNull: true},
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'chat'},
    name:	{ type: DataTypes.STRING, allowNull: false},
    URL: { type: DataTypes.STRING, allowNull: true},
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    description: { type: DataTypes.TEXT }
  },
   {
      // indexes: [],
      timestamps: true,
      tableName: 'topics',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Topic.belongsToMany(models.Session, { through: { model: models.SessionTopics } } );
        }
      }
    }
);
  return Topic;
};
