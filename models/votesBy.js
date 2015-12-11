"use strict";

module.exports = (Sequelize, DataTypes) => {
  var VotesBy = Sequelize.define('VotesBy', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
  },
  {
  // indexes: [],
    timestamps: true,
    tableName: 'votesBy',
    classMethods: {
      associate: function(models) {
        VotesBy.belongsTo(models.Event);
        VotesBy.belongsTo(models.User);
        VotesBy.belongsTo(models.Vote);
        VotesBy.belongsTo(models.Topic);
      }
    }
  });

  return VotesBy;
};
