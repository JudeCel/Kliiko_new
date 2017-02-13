'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var ConnectionLog = Sequelize.define('ConnectionLogs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    accountUserId: {type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: true },
    responseTime: { type: DataTypes.INTEGER, allowNull: false },
    level: { type: DataTypes.STRING, allowNull: false},
    meta: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
    req: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
    res: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
    createdAt: DataTypes.DATE
  }, {timestamps: false});

  return ConnectionLog;
};
