'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Survey = Sequelize.define('Survey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    contactListId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    thanks: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    closed: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    confirmedAt: { type: DataTypes.DATE, allowNull: true, validate: { notEmpty: true } },
    closedAt: { type: DataTypes.DATE, allowNull: true, validate: { notEmpty: true } },
    url: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Survey.hasMany(models.SurveyQuestion, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.hasMany(models.SurveyAnswer, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.belongsTo(models.ContactList, { foreignKey: 'contactListId', onDelete: 'SET NULL' });
        Survey.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Survey.belongsTo(models.Account, { foreignKey: 'accountId' });
      }
    }
  });

  return Survey;
};
