'use strict';

var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var Subscription = Sequelize.define('Subscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    subscriptionPlanId: { type: DataTypes.INTEGER, allowNull: false },
    planId: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    customerId: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    lastWebhookId: { type: DataTypes.STRING, allowNull: true },
    subscriptionId: { type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: true,
        isUnique: validations.unique(Sequelize, 'Subscription', 'subscriptionId')
      }
    },
    active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true }
  }, {
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        Subscription.belongsTo(models.Account, { foreignKey: 'accountId' });
        Subscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'subscriptionPlanId' });
        Subscription.hasOne(models.SubscriptionPreference, { foreignKey: 'subscriptionId' });
      }
    }
  });

  return Subscription;
};
