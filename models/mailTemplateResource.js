module.exports = (Sequelize, DataTypes) => {
  var MailTemplateResource = Sequelize.define('MailTemplateResource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mailTemplateId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: false }
  });

  return MailTemplateResource;
};
