'use strict';

module.exports = (Sequelize, DataTypes) => {
  var MiniSurvey = Sequelize.define('MiniSurvey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    question: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    type: { type: DataTypes.ENUM, allowNull: false, values: ['yesNoMaybe', '5starRating'] }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        MiniSurvey.hasMany(models.MiniSurveyAnswer, { onDelete: 'cascade', foreignKey: 'miniSurveyId' });
        MiniSurvey.hasOne(models.Console, {foreignKey: 'miniSurveyId' });
        MiniSurvey.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        MiniSurvey.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade'  });
      }
    }
  });

  return MiniSurvey;
};
