'use strict';
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false  },
    resourceId: { type: DataTypes.INTEGER, allowNull: true  },
    brandProjectPreferenceId: { type: DataTypes.INTEGER, allowNull: true  },

    name: { type: DataTypes.STRING, allowNull: false,  defaultValue: 'untitled', validate: { notEmpty: true } },

    start_time: { type: DataTypes.DATE, allowNull: false, defaultValue: Date.now(), validate: {
      isValid: function(value, next) {
        if(this.startTime > this.endTime) {
          next("Start date can't be higher then end date.")
        }
        else {
          next();
        }
      }
    } },
    end_time: { type: DataTypes.DATE, allowNull: false , defaultValue: Date.now() },
    incentive_details: { type: DataTypes.STRING, allowNull: true  },
    active:	{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    colours_used: { type: DataTypes.TEXT, allowNull: true },

    step: { type: DataTypes.ENUM, allowNull: false, values: constants.sessionBuilderSteps, defaultValue: 'setUp' },

    status: { type: DataTypes.ENUM, allowNull: false,
      values: ['build', 'expired', 'pending', 'active'], defaultValue: 'build' },

  }, {
    timestamps: true,
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.BrandProject, {foreignKey: 'brand_project_id'});
        Session.belongsTo(models.Account, {foreignKey: 'accountId'});
        Session.belongsTo(models.BrandProjectPreference, {foreignKey: 'brandProjectPreferenceId'});
        Session.belongsToMany(models.Topic, {through: {model: models.SessionTopics}, onDelete: 'cascade'});
        Session.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Session.hasMany(models.SessionMember, {foreignKey: 'sessionId', onDelete: 'cascade'});
        Session.hasMany(models.MailTemplate, {foreignKey: 'sessionId', onDelete: 'cascade', hooks:true});
        Session.hasMany(models.Invite, { foreignKey: 'sessionId', onDelete: 'cascade' });
      }
    }
  }
);
  return Session;
};
