"use strict";
var constants = require('../util/constants');
// holds original template. Gets copied to MailTemplates
module.exports = (Sequelize, DataTypes) => {
  var MailTemplateBase = Sequelize.define('MailTemplateBase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    subject: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: {type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: {type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true }},
    category: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "Category can't be empty"} } },
    mailTemplateActive: { type: DataTypes.INTEGER }
  });

  return MailTemplateBase;
};
