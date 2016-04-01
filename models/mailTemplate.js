"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplate = Sequelize.define('MailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    subject: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: {type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true } },
    sessionId: { type: DataTypes.INTEGER, allowNull: true, validate: { notEmpty: true } },
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isCopy: {type: DataTypes.BOOLEAN, allowNull: true}
  }, {
    classMethods: {
      associate: function(models) {
        MailTemplate.belongsTo(models.MailTemplateBase);
        MailTemplate.belongsTo(models.Account);
        MailTemplate.belongsTo(models.Session, { foreignKey: 'sessionId' });
      }
    }
  });

  return MailTemplate;
};
