"use strict";
/**
 * If default value == 0, then it  means UNLIMITED
 */
module.exports = (Sequelize, DataTypes) => {
  var Subscription = Sequelize.define('Subscription', {
      id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

      subscriptionId: { type: DataTypes.STRING, allowNull: false, unique: true},
      planId: { type: DataTypes.STRING, allowNull: false},
      planQuantity: { type: DataTypes.INTEGER, allowNull: false},
      status:  {type: DataTypes.ENUM, allowNull: false, values: [ 'future', 'in_trial', 'active', 'non_renewing', 'cancelled' ] },
      trialStart: {type: DataTypes.DATE, allowNull: true},
      trialEnd: {type: DataTypes.DATE, allowNull: true},
      subscribtionCreatedAt: {type: DataTypes.DATE, allowNull: false},
      startedAt: {type: DataTypes.DATE, allowNull: true},
      createdFromIp: {type: DataTypes.STRING, allowNull: false},
      hasScheduledChanges: {type: DataTypes.BOOLEAN, allowNull: false},
      dueInvoicesCount:  { type: DataTypes.INTEGER, allowNull: false},
      customerData:  { type: DataTypes.JSON, allowNull: false},
      cardData:  { type: DataTypes.JSON, allowNull: false},

    },
    {
      timestamps: true,
      tableName: 'Subscriptions',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Subscription.belongsTo(models.User);
          Subscription.belongsTo(models.Account);
        }
      }
    }
  );

  return Subscription;
};
