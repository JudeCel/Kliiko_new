"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Resource = Sequelize.define('Resource', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    private: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    accountUserId: { type: DataTypes.INTEGER, allowNull: true },
    topicId: { type: DataTypes.INTEGER, allowNull: true },
    image: { type: DataTypes.TEXT, allowNull: true },
    video: { type: DataTypes.TEXT, allowNull: true },
    file: { type: DataTypes.TEXT, allowNull: true },
    audio: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'video', 'audio', 'image', 'pdf', 'csv', 'link']
    },
    scope: { type: DataTypes.ENUM, allowNull: false,
      values: [ 'participant', 'facilitator', 'co-facilitator', 'observer',
        'report', 'vote', 'collage', 'brandLogo', 'youtubeUrl'
              ]
    }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Resource.belongsTo(models.Topic, { foreignKey: 'topicId' });
        Resource.belongsTo(models.Account, { foreignKey: 'accountId' });
        Resource.belongsTo(models.AccountUser, { foreignKey: 'accountUserId' });
        Resource.belongsTo(models.SessionMember, { foreignKey: 'sessionMemberId' });
        Resource.hasMany(models.Survey, { foreignKey: 'surveyId' });
        Resource.hasMany(models.Survey, { foreignKey: 'surveyQuestionId' });
      }
    }
  });

  return Resource;
};
