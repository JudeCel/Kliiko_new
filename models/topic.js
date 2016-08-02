'use strict';

var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Topic = Sequelize.define('Topic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'chat' },
    name: { type: DataTypes.STRING, allowNull: false,
      validate: {
        isUnique: validations.unique(Sequelize, 'Topic', 'name', { accountContext: true }),
      }
    },
    URL: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Topic.hasMany(models.SessionTopics, { foreignKey: 'topicId' });
        Topic.belongsToMany(models.Session, { through: { model: models.SessionTopics }, foreignKey: 'topicId' });
      }
    }
  });

  return Topic;
};
