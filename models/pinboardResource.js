"use strict";

module.exports = (Sequelize, DataTypes) => {
  var PinboardResource = Sequelize.define('PinboardResource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionTopicId: { type: DataTypes.INTEGER, allowNull: false },
    sessionMemberId: { type: DataTypes.INTEGER, allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: true},
  }, {
    indexes: [{
      name: "uniquePinboardResource",
      unique: true,
      fields: ['sessionTopicId', 'sessionMemberId']
    }],
    timestamps: true,
    classMethods: {
      associate: function(models) {
        PinboardResource.belongsTo(models.SessionTopics, { foreignKey: 'sessionTopicId', onDelete: 'cascade'});
        PinboardResource.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId', onDelete: 'cascade' });
        PinboardResource.belongsTo(models.Resource, { foreignKey: 'resourceId', onDelete: 'cascade' });
      }
    }
  });

  return PinboardResource;
};
