'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplateBase = Sequelize.define('MailTemplateBase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    subject: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: { type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true } },
    category: { type: DataTypes.ENUM, allowNull: false, values: Object.keys(constants.mailTemplateType), validate: { notEmpty: true } },
    mailTemplateActive: { type: DataTypes.INTEGER }
  });

  return MailTemplateBase;
};
