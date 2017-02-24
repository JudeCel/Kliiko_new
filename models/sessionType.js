"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionType = Sequelize.define('SessionType', {
    name: { type: DataTypes.STRING, primaryKey: true },
    properties: { type: DataTypes.JSONB, allowNull: false },
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SessionType.hasMany(models.Session, { foreignKey: 'type' });
      }
    }
  });

  return SessionType;
};
