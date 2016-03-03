"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Resource = Sequelize.define('Resource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    private: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    topicId: { type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    thumb_URL: { type: DataTypes.TEXT, allowNull: true },
    URL: { type: DataTypes.TEXT, allowNull: true },
    HTML: { type: DataTypes.TEXT, allowNull: true },
    JSON: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    resourceType: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'participant', 'facilitator', 'co-facilitator',
                'observer', 'image', 'video', 'audio', 'report',
                'vote', 'collage', 'tmp', 'pdf', 'brandLogo', 'youtubeUrl'
              ]
    }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Resource.belongsTo(models.Topic, { foreignKey: 'topicId' });
        Resource.belongsTo(models.User, { foreignKey: 'userId' });
        Resource.hasMany(models.Survey, { foreignKey: 'surveyId' });
        Resource.hasMany(models.Survey, { foreignKey: 'surveyQuestionId' });
      }
    }
  });

  return Resource;
};
