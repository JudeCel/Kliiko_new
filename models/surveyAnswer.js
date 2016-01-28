'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SurveyAnswer = Sequelize.define('SurveyAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    answers: { type: DataTypes.JSONB, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SurveyAnswer.belongsTo(models.Survey, { foreignKey: 'surveyId', through: models.SurveyQuestion });
      }
    }
  });

  return SurveyAnswer;
};
