"use strict";
var bcrypt = require('bcrypt');

module.exports = (Sequelize, DataTypes) => {
  var TemplateBanner = Sequelize.define('TemplateBanner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    page: { type: DataTypes.ENUM, values: ['profile', 'sessions', 'resources'], allowNull: false },
    filepath: { type: DataTypes.STRING, allowNull: false }
  });

  return TemplateBanner;
};
