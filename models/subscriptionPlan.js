'use strict';

var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var SubscriptionPlan = Sequelize.define('SubscriptionPlan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionCount: { type: DataTypes.INTEGER, allowNull: false },
    contactListCount: { type: DataTypes.INTEGER, allowNull: false },
    additionalContactListCount: { type: DataTypes.INTEGER, allowNull: false },
    surveyCount: { type: DataTypes.INTEGER, allowNull: false },
    contactListMemberCount: { type: DataTypes.INTEGER, allowNull: false },
    participantCount: { type: DataTypes.INTEGER, allowNull: false },
    observerCount: { type: DataTypes.INTEGER, allowNull: false },
    paidSmsCount: { type: DataTypes.INTEGER, allowNull: false },
    priority: { type: DataTypes.INTEGER, allowNull: false },
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
