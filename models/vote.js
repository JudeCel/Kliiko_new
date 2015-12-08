"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Vote = Sequelize.define('Vote', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    eventId: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  },
  {
  // indexes: [],
    timestamps: true,
    tableName: 'votes',
    paranoid: true,
    classMethods: {
      associate: function(models) {
        Vote.belongsToMany(models.User, { through: models.VotesBy, foreignKey: 'userId' });
        Vote.belongsTo(models.Event, {foreignKey: 'eventId'});
      }
    }
  });

  return Vote;
};
