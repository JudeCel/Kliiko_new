"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    }, {
      timestamps: true,
      tableName: 'SessionTopics',
      classMethods: {
        associate: function(models) {
          SessionTopics.belongsTo(models.Topic);
          SessionTopics.belongsTo(models.Session);
        }
      }
    }
  );

  return SessionTopics;
};
