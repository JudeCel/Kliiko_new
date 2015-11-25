"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Vote = Sequelize.define('Vote', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    event_id: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, default: 0},
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'votes',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Vote.belongsTo(models.Event, {foreignKey: 'event_id'});
        }
      }
    }
);
  return Vote;
};
