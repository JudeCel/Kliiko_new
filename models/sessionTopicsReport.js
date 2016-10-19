"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopicsReport = Sequelize.define('SessionTopicsReport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true },
    type: {
      type: DataTypes.ENUM, allowNull: false,
      values: ['all', 'star', 'votes', 'whiteboard']
    },
    scopes: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
    },
    includes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    format: {
      type: DataTypes.ENUM, allowNull: false,
      values: ['txt', 'csv', 'pdf']
    },
    status: {
      type: DataTypes.ENUM, allowNull: false,
      values: [ 'completed', 'progress', 'failed'],
      defaultValue: 'progress'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopicsReport.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        SessionTopicsReport.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade' });
        SessionTopicsReport.belongsTo(models.Resource, { foreignKey: 'resourceId'});
      }
    }
  });

  return SessionTopicsReport;
};
