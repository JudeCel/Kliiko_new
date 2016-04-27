"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Console = Sequelize.define('Console', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    audioId: { type: DataTypes.INTEGER, allowNull: true },
    videoId: { type: DataTypes.INTEGER, allowNull: true },
    iamageId: { type: DataTypes.INTEGER, allowNull: true },
    fileId: { type: DataTypes.INTEGER, allowNull: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Console.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId' });
        Console.belongsTo(models.Account, { foreignKey: 'accountId' });
        Console.belongsTo(models.Session, { foreignKey: 'sessionId' });

        Console.belongsTo(models.Resource, { foreignKey: 'audioId' });
        Console.belongsTo(models.Resource, { foreignKey: 'videoId' });
        Console.belongsTo(models.Resource, { foreignKey: 'iamageId' });
        Console.belongsTo(models.Resource, { foreignKey: 'fileId' });
        Console.belongsTo(models.Survey, { foreignKey: 'surveyId' });
      }
    }
  });

  return Console;
};
