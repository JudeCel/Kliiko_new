"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopicsReport = Sequelize.define('SessionTopicsReport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'completed', 'progress', 'failed'],
      defaultValue: 'progress'
    },
    message: {type: DataTypes.TEXT, allowNull: true}
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
