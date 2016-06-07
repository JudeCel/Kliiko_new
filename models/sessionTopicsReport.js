"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopicsReport = Sequelize.define('SessionTopicsReport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopicsReport.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId' });
        SessionTopicsReport.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
        SessionTopicsReport.hasOne(models.Resource, { foreignKey: 'resourceId' });
      }
    }
  });

  return SessionTopicsReport;
};
