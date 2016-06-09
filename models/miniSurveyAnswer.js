'use strict';

module.exports = (Sequelize, DataTypes) => {
  var MiniSurveyAnswer = Sequelize.define('MiniSurveyAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    miniSurveyId: { type: DataTypes.INTEGER, allowNull: false },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    answer: { type: DataTypes.JSONB, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        MiniSurveyAnswer.belongsTo(models.MiniSurvey, { foreignKey: 'miniSurveyId' });
        MiniSurveyAnswer.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
      }
    }
  });

  return MiniSurveyAnswer;
};
