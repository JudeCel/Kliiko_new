'use strict';

var constants = require('../util/constants');
var MessagesUtil = require('./../util/messages');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false  },
    participantListId: { type: DataTypes.INTEGER, allowNull: true  },
    brandProjectPreferenceId: { type: DataTypes.INTEGER, allowNull: true  },
    name: { type: DataTypes.STRING, allowNull: false,  defaultValue: 'untitled', validate: {
      notEmpty: true,
      isLength: validations.length('name', { max: 20 })
    } },
    startTime: { type: DataTypes.DATE, allowNull: false, defaultValue: initializeDate(), validate: { isValid: validateDate } },
    endTime: { type: DataTypes.DATE, allowNull: false , defaultValue: initializeDate() },
    timeZone: { type: DataTypes.STRING, allowNull: true },
    incentive_details: { type: DataTypes.STRING, allowNull: true  },
    colours_used: { type: DataTypes.TEXT, allowNull: true },
    step: { type: DataTypes.ENUM, allowNull: false, values: constants.sessionBuilderSteps, defaultValue: 'setUp' },
    status: { type: DataTypes.ENUM, allowNull: false, values: ['open', 'closed'], defaultValue: 'open' },
  }, {
    timestamps: true,
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.BrandProject, { foreignKey: 'brand_project_id' });
        Session.belongsTo(models.Account, { foreignKey: 'accountId' });
        Session.belongsTo(models.BrandProjectPreference, { foreignKey: 'brandProjectPreferenceId' });
        Session.belongsToMany(models.Topic, { through: {model: models.SessionTopics}, foreignKey: 'sessionId' });
        Session.belongsTo(models.ContactList, { foreignKey: 'participantListId' });
        Session.hasMany(models.SessionTopics, { foreignKey: 'sessionId' });
        Session.hasMany(models.MiniSurvey, { foreignKey: 'sessionId' });
        Session.hasMany(models.SessionMember, { foreignKey: 'sessionId' });
        Session.hasMany(models.MailTemplate, { foreignKey: 'sessionId' });
        Session.hasMany(models.Invite, { foreignKey: 'sessionId' });
        Session.hasMany(models.DirectMessage, { foreignKey: 'sessionId' });
        Session.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Session.belongsToMany(models.Resource, { through: {model: models.SessionResource}, foreignKey: 'sessionId' });
        Session.hasMany(models.SessionTopicsReport, { foreignKey: 'sessionId' });
      }
    }
  });

  return Session;
};

function validateDate(value, next) {
  if(this.startTime > this.endTime) {
    next(MessagesUtil.models.session.date);
  }
  else {
    next();
  }
}

function initializeDate() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
