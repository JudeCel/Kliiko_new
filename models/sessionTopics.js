"use strict";

module.exports = (Sequelize, DataTypes) => {
  var sessionTopics = Sequelize.define('SessionTopics', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    }, {
      classMethods: {
        associate: function(models) {
          sessionTopics.belongsTo(models.Topic);
          sessionTopics.belongsTo(models.Session);
        }
      }
    }
  );

  return sessionTopics;
};
