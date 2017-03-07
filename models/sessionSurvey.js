module.exports = (Sequelize, DataTypes) => {
  var SessionSurvey = Sequelize.define('SessionSurvey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    surveyId: { type: DataTypes.INTEGER, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    classMethods: {
      associate: function(models) {
        SessionSurvey.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        SessionSurvey.belongsTo(models.Survey, { foreignKey: 'surveyId', onDelete: 'cascade' });
      }
    }
  });

  return SessionSurvey;
};
