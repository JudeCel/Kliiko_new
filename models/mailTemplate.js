'use strict';

var constants = require('../util/constants');
var validations = require('./validations');

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
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isCopy: {type: DataTypes.BOOLEAN, allowNull: true}
  }, {
    timestamps: true,
    indexes:[{
      name: 'compositeAccountIdMailTemplateBaseIdAndTemplateName',
      unique: true,
      fields: ['name', 'AccountId', 'MailTemplateBaseId']
    }],
    classMethods: {
      associate: function(models) {
        MailTemplate.belongsTo(models.MailTemplateBase);
        MailTemplate.belongsTo(models.Account);
        MailTemplate.belongsToMany(models.Resource, { through: {model: models.MailTemplateResource}, foreignKey: 'mailTemplateId' });
        MailTemplate.belongsToMany(models.Session, { through: {model: models.SessionMailTemplate, onDelete: 'cascade' }, foreignKey: 'mailTemplateId' });
        MailTemplate.hasMany(models.SessionMailTemplate, { foreignKey: 'mailTemplateId' });
      }
    }
  });

  return MailTemplate;
};
