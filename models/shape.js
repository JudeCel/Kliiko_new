"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Shape = Sequelize.define('Shape', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    topicId: { type: DataTypes.INTEGER, allowNull: false },
    uid: { type: DataTypes.STRING, allowNull: true },
    event: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Shape.belongsTo(models.Topic, { foreignKey: 'topicId' });
        Shape.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
      }
    }
  });

  return Shape;
};
