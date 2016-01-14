'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SurveyAnswer = Sequelize.define('SurveyAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    surveyQuestionId: { type: DataTypes.INTEGER, allowNull: false },
    answer: { type: DataTypes.JSONB, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SurveyAnswer.belongsTo(models.Survey, { foreignKey: 'surveyId', through: models.SurveyQuestion });
        SurveyAnswer.belongsTo(models.SurveyQuestion, { foreignKey: 'surveyQuestionId' });
      }
    }
  });

  return SurveyAnswer;
};
