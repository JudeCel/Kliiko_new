'use strict';

var validations = require('./validations');
var surveyConstants = require('../util/surveyConstants');

module.exports = (Sequelize, DataTypes) => {
  var SurveyQuestion = Sequelize.define('SurveyQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    name: { type: DataTypes.STRING, allowNull: false, validate: {
      notEmpty: true,
      isLength: validations.length('question', { max: surveyConstants.minsMaxs.input.max })
    } },
    question: { type: DataTypes.TEXT, allowNull: false, validate: {
      notEmpty: true,
      isLength: validations.length('question', { max: surveyConstants.minsMaxs.textarea.max })
    } },
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
