"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplate = Sequelize.define('MailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    subject: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: {type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: {type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true } },
    isCopy: {type: DataTypes.BOOLEAN, allowNull: true}
    }, {
      classMethods: {
        associate: function(models) {
          MailTemplate.belongsTo(models.MailTemplateBase);
          MailTemplate.belongsTo(models.Account);
        }
      }
    });
  return MailTemplate;
};
