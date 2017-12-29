'use strict';
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Survey = Sequelize.define('Survey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    contactListId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, not: ['\&'] } },
    description: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    thanks: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    closed: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    confirmedAt: { type: DataTypes.DATE, allowNull: true, validate: { notEmpty: true } },
    closedAt: { type: DataTypes.DATE, allowNull: true, validate: { notEmpty: true } },
    url: { type: DataTypes.STRING, allowNull: true },
    surveyType: { type: DataTypes.ENUM, values: Object.keys(constants.surveyTypes), allowNull: false, defaultValue: constants.surveyTypes.recruiter }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Survey.hasMany(models.SurveyQuestion, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.hasMany(models.SurveyAnswer, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.belongsTo(models.ContactList, { foreignKey: 'contactListId', onDelete: 'SET NULL' });
        Survey.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Survey.belongsTo(models.Account, { foreignKey: 'accountId' });
        Survey.belongsToMany(models.Session, { through: models.SessionSurvey, onDelete: 'cascade', hooks: true, foreignKey: "surveyId"});
      }
    }
  });

  return Survey;
};
