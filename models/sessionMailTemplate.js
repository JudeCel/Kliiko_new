module.exports = (Sequelize, DataTypes) => {
  var SessionMailTemplate = Sequelize.define('SessionMailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    mailTemplateId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return SessionMailTemplate;
};
