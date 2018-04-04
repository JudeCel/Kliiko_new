'use strict';

let constants = require('../util/constants');

let hookEvents = [
    constants.zapierHookEvents.socialForumCreated, 
    constants.zapierHookEvents.socialForumWithWrapTopicCreated,
    constants.zapierHookEvents.guestInvitationHistory,
];

module.exports = (Sequelize, DataTypes) => {
  let ZapierSubscription = Sequelize.define('ZapierSubscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    event: { type: DataTypes.ENUM, allowNull: false, values: hookEvents },
    targetUrl: {  type : DataTypes.STRING, allowNull: false, validate: { isUrl: true }},
  }, {
    indexes: [{ fields: ['event', 'accountId'] }],
    classMethods: {
      associate: (models) => {
        ZapierSubscription.belongsTo(models.Account, { foreignKey: 'accountId' })
      }
    }
  });
  
  return ZapierSubscription;
};
