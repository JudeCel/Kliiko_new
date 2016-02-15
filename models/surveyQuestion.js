'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SurveyQuestion = Sequelize.define('SurveyQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    question: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    order: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM, allowNull: false, validate: { notEmpty: true },
      values: ['radio', 'textarea', 'checkbox', 'input'] },
    answers: { type: DataTypes.JSONB, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SurveyQuestion.belongsTo(models.Survey, { foreignKey: 'surveyId' });
        SurveyQuestion.belongsTo(models.Resource, { foreignKey: 'resourceId' });
      }
    }
  });

  return SurveyQuestion;
};
