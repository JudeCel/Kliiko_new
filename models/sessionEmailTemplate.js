"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionEmailTemplate = Sequelize.define('SessionEmailTemplate', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    }, {
      timestamps: true,
      tableName: 'SessionEmailTemplate',
      classMethods: {
        associate: function(models) {
          SessionEmailTemplate.belongsTo(models.MailTemplate);
          SessionEmailTemplate.belongsTo(models.Session);
        }
      }
    }
  );

  return SessionEmailTemplate;
};
