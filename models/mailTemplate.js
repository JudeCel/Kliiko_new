"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplate = Sequelize.define('MailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    subject: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    content: {type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } }
    }, {
      classMethods: {
        associate: function(models) {
          MailTemplate.belongsTo(models.MailTemplateBase);
          MailTemplate.belongsTo(models.User);
        }
      }
    });
  return MailTemplate;
};