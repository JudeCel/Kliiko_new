"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      order: { type: DataTypes.INTEGER, allowNull: true},
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
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
