'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Banner = Sequelize.define('Banner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    page: { type: DataTypes.ENUM, values: ['profile', 'sessions', 'resources'], allowNull: false },
    resourceId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Banner.belongsTo(models.Resource, { onDelete: 'cascade', foreignKey: 'resourceId' });
      }
    }
  });

  return Banner;
};
