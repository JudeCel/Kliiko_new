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
    colours_used: { type: DataTypes.TEXT, allowNull: true },

    step: { type: DataTypes.ENUM, allowNull: false, values: constants.sessionBuilderSteps, defaultValue: 'setUp' },

    status: { type: DataTypes.ENUM, allowNull: false,
      values: ['build', 'expired', 'pending', 'open', 'closed'], defaultValue: 'build'},

  }, {
    timestamps: true,
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.BrandProject, {foreignKey: 'brand_project_id'});
        Session.belongsTo(models.Account, {foreignKey: 'accountId'});
        Session.belongsTo(models.BrandProjectPreference, {foreignKey: 'brandProjectPreferenceId'});
        Session.belongsToMany(models.Topic, {through: {model: models.SessionTopics}, foreignKey: 'sessionId'});
        Session.belongsTo(models.ContactList, { foreignKey: 'participantListId' });
        Session.hasMany(models.SessionTopics, {foreignKey: 'sessionId'});
        Session.hasMany(models.MiniSurvey, {foreignKey: 'sessionId'});
        Session.hasMany(models.SessionMember, {foreignKey: 'sessionId'});
        Session.hasMany(models.MailTemplate, {foreignKey: 'sessionId'});
        Session.hasMany(models.Invite, { foreignKey: 'sessionId' });
        Session.hasMany(models.DirectMessage, { foreignKey: 'sessionId' });
        Session.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Session.belongsToMany(models.Resource, {through: {model: models.SessionResource}, foreignKey: 'sessionId'});
        Session.hasMany(models.SessionTopicsReport, { foreignKey: 'sessionId' });
      }
    }
  }
);
  return Session;
};
