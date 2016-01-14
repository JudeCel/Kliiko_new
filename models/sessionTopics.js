"use strict";

module.exports = (Sequelize, DataTypes) => {
  var sessionTopics = Sequelize.define('SessionTopics', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      sessionId: { type: DataTypes.INTEGER, allowNull: false },
      topicId: { type: DataTypes.INTEGER, allowNull: false},
    }, {
      classMethods: {
        associate: function(models) {
          sessionTopics.belongsTo(models.Topic, {foreignKey: 'sessionId'});
          sessionTopics.belongsTo(models.Session, {foreignKey: 'sessionId'});
        }
      }
    }
  );

  return sessionTopics;
};
