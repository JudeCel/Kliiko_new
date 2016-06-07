"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopicReport = Sequelize.define('SessionTopicReport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    SessionResourceId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopicReport.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId' });
        SessionTopicReport.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
        SessionTopicReport.belongsTo(models.SessionResource, { foreignKey: 'SessionResourceId' });
      }
    }
  });

  return SessionTopicReport;
};
