'use strict';

var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Topic = Sequelize.define('Topic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    boardMessage: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Say something nice if you wish!', validate: { notEmpty: true } },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, isUnique: validations.unique(Sequelize, 'Topic', 'name', { accountContext: true }) } },
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
