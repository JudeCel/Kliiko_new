'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Survey = Sequelize.define('Survey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    description: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    closed: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    confirmedAt: { type: DataTypes.DATE, allowNull: true, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    url: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Survey.hasMany(models.SurveyQuestion, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.hasMany(models.SurveyAnswer, { onDelete: 'cascade', foreignKey: 'surveyId' });
        Survey.belongsTo(models.Account, { foreignKey: 'accountId' });
      }
    }
  });

  return Survey;
};
