"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Resource = Sequelize.define('Resource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    stock: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    accountUserId: { type: DataTypes.INTEGER, allowNull: true },
    topicId: { type: DataTypes.INTEGER, allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true },
    video: { type: DataTypes.TEXT, allowNull: true },
    file: { type: DataTypes.TEXT, allowNull: true },
    audio: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.TEXT, allowNull: true },
    expiryDate: { type: DataTypes.DATE, allowNull: true },
    properties: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    status: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'completed', 'progress', 'failed'],
      defaultValue: 'completed'
    },
    type: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'video', 'audio', 'image', 'file', 'link']
    },
    scope: { type: DataTypes.ENUM, allowNull: false,
      //unused values (like youtube) should be removed before prod db clear
      values: [ 'participant', 'facilitator', 'co-facilitator', 'observer', 'report', 'vote',
        'collage', 'brandLogo', 'youtube', 'zip', 'pdf', 'csv', 'banner', 'txt', 'pinboard', 'videoService' ]
    },
    source: { type: DataTypes.ENUM, allowNull: true,
      values: [ 'youtube', 'vimeo' ]
    }
  }, {
    timestamps: true,
    indexes: [
      { name: "UniqResourceNameByAccount",
        unique: {args: true},
        fields: ['accountId','name', 'type']
    }],
    classMethods: {
      associate: function(models) {
        Resource.belongsTo(models.Topic, { foreignKey: 'topicId' });
        Resource.belongsTo(models.Account, { foreignKey: 'accountId' });
        Resource.belongsTo(models.AccountUser, { foreignKey: 'accountUserId' });
        Resource.hasMany(models.Banner, {foreignKey: 'resourceId' });
        Resource.hasMany(models.Survey, { foreignKey: 'resourceId' });
        Resource.hasMany(models.SurveyQuestion, { foreignKey: 'resourceId' });
        Resource.belongsToMany(models.Session, {through: {model: models.SessionResource, onDelete: 'cascade'}, foreignKey: 'resourceId'});
      }
    }
  });

  return Resource;
};
