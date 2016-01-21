"use strict";
var constants = require('../util/constants');
// holds original template. Gets copied to MailTemplates
module.exports = (Sequelize, DataTypes) => {
  var MailTemplateBase = Sequelize.define('MailTemplateBase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    subject: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    content: {type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } }
  });
   
  return MailTemplateBase;
};