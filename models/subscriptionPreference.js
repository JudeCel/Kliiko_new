'use strict';

var validations = require('./validations');
var planConstants = require('./../util/planConstants');

module.exports = (Sequelize, DataTypes) => {
  var SubscriptionPreference = Sequelize.define('SubscriptionPreference', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subscriptionId: { type: DataTypes.INTEGER, allowNull: false },
    data: { type: DataTypes.JSONB, allowNull: false, defaultValue: planConstants.Free }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        SubscriptionPreference.belongsTo(models.Subscription, { foreignKey: 'subscriptionId' });
      }
    }
  });

  return SubscriptionPreference;
};
