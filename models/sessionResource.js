module.exports = (Sequelize, DataTypes) => {
  var SessionResource = Sequelize.define('SessionResource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return SessionResource;
};
