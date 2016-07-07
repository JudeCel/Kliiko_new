"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Console = Sequelize.define('Console', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    audioId: { type: DataTypes.INTEGER, allowNull: true },
    videoId: { type: DataTypes.INTEGER, allowNull: true },
    pinboard:	{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    fileId: { type: DataTypes.INTEGER, allowNull: true },
    miniSurveyId: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Console.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId' });
        Console.belongsTo(models.Resource, { foreignKey: 'audioId' });
        Console.belongsTo(models.Resource, { foreignKey: 'videoId' });
        Console.belongsTo(models.Resource, { foreignKey: 'imageId' });
        Console.belongsTo(models.Resource, { foreignKey: 'fileId' });
        Console.belongsTo(models.MiniSurvey, { foreignKey: 'miniSurveyId' });
      }
    }
  });

  return Console;
};
