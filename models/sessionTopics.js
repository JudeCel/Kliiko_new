"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
    landing: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    boardMessage: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Say something nice if you wish!', validate: { notEmpty: true } },
    name: { type: DataTypes.STRING, allowNull: true, validate: { notEmpty: true } }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopics.belongsTo(models.Topic, { foreignKey: 'topicId', onDelete: 'cascade' });
        SessionTopics.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        SessionTopics.hasMany(models.MiniSurvey, { foreignKey: 'sessionTopicId'});
        SessionTopics.hasOne(models.Console, { foreignKey: 'sessionTopicId'});
        SessionTopics.hasMany(models.SessionTopicsReport, { foreignKey: 'sessionTopicId' });
      }
    }
  });

  return SessionTopics;
};
