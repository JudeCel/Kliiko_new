"use strict";
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplate = Sequelize.define('MailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    subject: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: {type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: {type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true } },
    sessionId: { type: DataTypes.INTEGER, allowNull: false, validate: { notEmpty: true } },
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
    }, {
      classMethods: {
        associate: function(models) {
          MailTemplate.belongsTo(models.User);
          MailTemplate.belongsTo(models.Session, { onDelete: 'cascade', foreignKey: 'sessionId' });
        }
      }
    });
  return MailTemplate;
};
