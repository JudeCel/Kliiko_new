"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    boardMessage: { type: DataTypes.STRING, allowNull: true, validate: { notEmpty: true } },
    name: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopics.belongsTo(models.Topic, { foreignKey: 'topicId' });
        SessionTopics.belongsTo(models.Session, { foreignKey: 'sessionId' });
        SessionTopics.hasMany(models.MiniSurvey, { foreignKey: 'sessionTopicId', onDelete: 'cascade' });
      }
    }
  });

  return SessionTopics;
};
