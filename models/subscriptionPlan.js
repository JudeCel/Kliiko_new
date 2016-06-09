'use strict';

var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var SubscriptionPlan = Sequelize.define('SubscriptionPlan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionCount: { type: DataTypes.INTEGER, allowNull: false },
    contactListCount: { type: DataTypes.INTEGER, allowNull: false },
    recruiterContactListCount: { type: DataTypes.INTEGER, allowNull: false },
    importDatabase: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    brandLogoAndCustomColors: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    contactListMemberCount: { type: DataTypes.INTEGER, allowNull: false },
    accountUserCount: { type: DataTypes.INTEGER, allowNull: false },
    exportContactListAndParticipantHistory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    exportRecruiterSurveyData: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    accessKlzziForum: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    accessKlzziFocus: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    canInviteObserversToSession: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    paiedSmsCount: { type: DataTypes.INTEGER, allowNull: false },
    discussionGuideTips: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    whiteboardFunctionality: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    uploadToGallery: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    reportingFunctions: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    availableOnTabletAndMobilePlatforms: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    customEmailInvitationAndReminderMessages: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    topicCount: { type: DataTypes.INTEGER, allowNull: false },
    priority: { type: DataTypes.INTEGER, allowNull: false },
    surveyCount: { type: DataTypes.INTEGER, allowNull: false },
    participantCount: { type: DataTypes.INTEGER, allowNull: false },
    observerCount: { type: DataTypes.INTEGER, allowNull: false },

    chargebeePlanId: { type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: true,
        isUnique: validations.unique(Sequelize, 'SubscriptionPlan', 'chargebeePlanId')
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        SubscriptionPlan.hasMany(models.Subscription, { foreignKey: 'subscriptionPlanId' });
      }
    }
  });

  return SubscriptionPlan;
};
