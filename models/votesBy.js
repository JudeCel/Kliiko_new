"use strict";

module.exports = (Sequelize, DataTypes) => {
  var VotesBy = Sequelize.define('VotesBy', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    eventId: { type: DataTypes.INTEGER, allowNull: true},
    userId: { type: DataTypes.INTEGER, allowNull: true},
    topicId: { type: DataTypes.INTEGER, allowNull: true},
    voteId: { type: DataTypes.INTEGER, allowNull: true},
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  },
  {
  // indexes: [],
    timestamps: true,
    tableName: 'votesBy',
    paranoid: true,
    classMethods: {
      associate: function(models) {
        VotesBy.belongsTo(models.Event, {foreignKey: 'eventId'});
        VotesBy.belongsTo(models.User, {foreignKey: 'userId'});
        VotesBy.belongsTo(models.Vote, {foreignKey: 'voteId'});
        VotesBy.belongsTo(models.Topic, {foreignKey: 'topicId'});
      }
    }
  });

  return VotesBy;
};
