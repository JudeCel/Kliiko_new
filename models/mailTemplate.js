'use strict';

var constants = require('../util/constants');
var validations = require('./validations');
var MessagesUtil = require('./../util/messages');

module.exports = (Sequelize, DataTypes) => {
  var MailTemplate = Sequelize.define('MailTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: {
      notEmpty: true,
      isLength: validations.length('name', { max: 255 })
    } },
    subject: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    content: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
    systemMessage: {type: DataTypes.BOOLEAN, allowNull: false, validate: { notEmpty: true } },
    sessionId: { type: DataTypes.INTEGER, allowNull: true, validate: { notEmpty: true } },
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isCopy: {type: DataTypes.BOOLEAN, allowNull: true}
  }, {
    indexes:[{
      name: 'compositeAccountIdMailTemplateBaseIdAndTemplateName',
      unique: { msg: 'THIS IS TEST' },
      fields: ['name', 'AccountId', 'MailTemplateBaseId']
    }],
    classMethods: {
      associate: function(models) {
        MailTemplate.belongsTo(models.MailTemplateBase);
        MailTemplate.belongsTo(models.Account);
        MailTemplate.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        MailTemplate.belongsToMany(models.Resource, { through: {model: models.MailTemplateResource}, foreignKey: 'mailTemplateId' });
      }
    }
  });

  return MailTemplate;
};
