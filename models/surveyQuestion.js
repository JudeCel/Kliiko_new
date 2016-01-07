'use strict';

module.exports = (Sequelize, DataTypes) => {
  var SurveyQuestion = Sequelize.define('SurveyQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    question: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    order: { type: DataTypes.INTEGER, allowNull: false },
    answers: { type: DataTypes.JSONB, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SurveyQuestion.belongsTo(models.Survey, { foreignKey: 'surveyId' });
        SurveyQuestion.hasMany(models.SurveyAnswer);
      }
    }
  });

  return SurveyQuestion;
};
