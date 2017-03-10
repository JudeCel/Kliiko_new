module.exports = (Sequelize, DataTypes) => {
  var SessionSurvey = Sequelize.define('SessionSurvey', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});

  return SessionSurvey;
};
