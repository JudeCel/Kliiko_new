'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Survey = Sequelize.define('Survey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    closed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Survey.hasMany(models.SurveyQuestion, { foreignKey: 'surveyId' });
        Survey.hasMany(models.SurveyAnswer);
        Survey.belongsTo(models.Account, { foreignKey: 'accountId' });
      }
    }
  });

  return Survey;
};
