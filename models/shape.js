"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Shape = Sequelize.define('Shape', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    uid: { type: DataTypes.STRING, allowNull: true },
    event: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['sessionMemberId'] },
      { fields: ['sessionTopicId'] },
      { fields: ['uid'] },
    ],
    classMethods: {
      associate: function(models) {
        Shape.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade' });
        Shape.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId', onDelete: 'cascade' });
      }
    }
  });

  return Shape;
};
