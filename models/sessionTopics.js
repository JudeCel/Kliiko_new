"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    name: { type: DataTypes.STRING, allowNull: true },
    greetingMessage: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopics.belongsTo(models.Topic, { foreignKey: 'topicId' });
        SessionTopics.belongsTo(models.Session, { foreignKey: 'sessionId' });
      }
    }
  });

  return SessionTopics;
};
