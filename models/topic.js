'use strict';

var topicConstants = require('../util/topicConstants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Topic = Sequelize.define('Topic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    boardMessage: { type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('boardMessage', { max: topicConstants.validations.boardMessage }) } },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true,
      isUnique: validations.unique(Sequelize, 'Topic', 'name', { accountContext: true }),
      isLength: validations.length('name', { max: topicConstants.validations.name })
    } },
    sign: { type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('sign', { max: topicConstants.validations.sign })
    } },
    default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    stock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
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
