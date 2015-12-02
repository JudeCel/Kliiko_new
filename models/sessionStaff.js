"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionStaff = Sequelize.define('SessionStaff', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: { type: DataTypes.INTEGER, allowNull: false},
    topic_id:	{type: DataTypes.INTEGER, allowNull: false},
    comments:	{type: DataTypes.TEXT, allowNull: true},
    active:	{type: DataTypes.BOOLEAN, allowNull: false}

  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'session_staff',
      paranoid: true,
      classMethods: {
        associate: function(models) {
        }
      }
    }
);
  return SessionStaff;
};
