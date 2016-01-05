'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SurveyAnswer = Sequelize.define('SurveyAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyQuestionId: { type: DataTypes.INTEGER, allowNull: false },
    selected: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SurveyAnswer.belongsTo(models.SurveyQuestion, { foreignKey: 'surveyQuestionId' });
        SurveyAnswer.belongsTo(models.Survey, { foreignKey: 'surveyQuestionId', through: models.SurveyQuestion });
      }
    }
  });

  return SurveyAnswer;
};
