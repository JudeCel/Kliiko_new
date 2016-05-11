"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionTopics = Sequelize.define('SessionTopics', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order: { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    name: { type: DataTypes.STRING, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionTopics.belongsTo(models.Topic);
        SessionTopics.belongsTo(models.Session);
      }
    }
  });

  return SessionTopics;
};
