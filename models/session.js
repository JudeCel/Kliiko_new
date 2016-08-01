'use strict';
var constants = require('../util/constants');

function initializeDate() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false  },
    participantListId: { type: DataTypes.INTEGER, allowNull: true  },
    brandProjectPreferenceId: { type: DataTypes.INTEGER, allowNull: true  },

    name: { type: DataTypes.STRING, allowNull: false,  defaultValue: 'untitled', validate: { notEmpty: true } },

    startTime: { type: DataTypes.DATE, allowNull: false, defaultValue: initializeDate(), validate: {
      isValid: function(value, next) {
        if(this.startTime > this.endTime) {
          next("Start date can't be higher then end date.")
        }
        else {
          next();
        }
      }
    } },
    endTime: { type: DataTypes.DATE, allowNull: false , defaultValue: initializeDate() },
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
        Session.belongsToMany(models.Topic, {through: {model: models.SessionTopics, onDelete: 'cascade'}, foreignKey: 'sessionId'});
        Session.belongsTo(models.ContactList, { foreignKey: 'participantListId' });
        Session.hasMany(models.SessionTopics, {foreignKey: 'sessionId', onDelete: 'cascade'});
        Session.hasMany(models.MiniSurvey, {foreignKey: 'sessionId', onDelete: 'cascade'});
        Session.hasMany(models.SessionMember, {foreignKey: 'sessionId', onDelete: 'cascade'});
        Session.hasMany(models.MailTemplate, {foreignKey: 'sessionId', onDelete: 'cascade', hooks:true});
        Session.hasMany(models.Invite, { foreignKey: 'sessionId', onDelete: 'cascade' });
        Session.hasMany(models.DirectMessage, { foreignKey: 'sessionId', onDelete: 'cascade' });
        Session.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Session.belongsToMany(models.Resource, {through: {model: models.SessionResource}, foreignKey: 'sessionId'});
        Session.hasMany(models.SessionTopicsReport, { foreignKey: 'sessionId', onDelete: 'cascade' });
      }
    }
  }
);
  return Session;
};
