"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    brand_project_id: { type: DataTypes.INTEGER, allowNull: false},
    name:	{ type: DataTypes.STRING, allowNull: false, default: 'untitled'},
    start_time:	{ type: DataTypes.DATE, allowNull: false },
    end_time:	{ type: DataTypes.DATE, allowNull: false },
    incentive_details: { type: DataTypes.TEXT, allowNull: true },
    status_id:	{ type: DataTypes.INTEGER, allowNull: false},
    active_topic_id:{ type: DataTypes.INTEGER, allowNull: true},
    colours_used: { type: DataTypes.TEXT, allowNull: true },

    created:	{ type: DataTypes.DATE},// need remove
    updated:	{ type: DataTypes.DATE},// need remove
    deleted:	{ type: DataTypes.DATE}// need remove
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'logs',
      // paranoid: true,
      classMethods: {
        associate: function(models) {
        }
      }
    }
);
  return Session;
};
