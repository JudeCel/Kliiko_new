"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Resource = Sequelize.define('Resource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    topicId:	{ type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    thumb_URL: { type: DataTypes.TEXT, allowNull: true },
    URL:	{ type: DataTypes.TEXT, allowNull: true },
    HTML:	{ type: DataTypes.TEXT, allowNull: true },
    JSON:	{ type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    resource_type: {type: DataTypes.ENUM, allowNull: false,
      values: [ 'participant', 'facilitator', 'co-facilitator',
                'observer', 'image', 'video', 'audio', 'report',
                'vote', 'collage', 'tmp'
              ]
    }
    //
  },{
      timestamps: true,
      classMethods: {
        associate: function(models) {
          Resource.belongsTo(models.Topic, {foreignKey: 'topicId'});
          Resource.belongsTo(models.User, {foreignKey: 'userId'});
        }
      }
    }
);
  return Resource;
};
