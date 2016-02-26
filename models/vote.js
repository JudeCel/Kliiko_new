"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Vote = Sequelize.define('Vote', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
  },
  {
  // indexes: [],
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Vote.belongsTo(models.SessionMember, {foreignKey: 'sessionMemberId'});
        Vote.belongsTo(models.Event, {foreignKey: 'eventId'});
      }
    }
  });
  return Vote;
};
