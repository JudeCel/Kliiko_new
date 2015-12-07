"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Vote = Sequelize.define('Vote', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    eventId: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'votes',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Vote.belongsTo(models.Event, {foreignKey: 'eventId'});
        }
      }
    }
);
  return Vote;
};
