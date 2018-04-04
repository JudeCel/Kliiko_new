'use strict';

 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError
 let constants = require('../util/constants');

 module.exports = {
    up: (queryInterface, Sequelize) => {
      return new Bluebird((resolve, reject) => {
        queryInterface.createTable('ZapierSubscriptions', {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          event: { type: Sequelize.ENUM, allowNull: false, values: [
            constants.zapierHookEvents.socialForumCreated, 
            constants.zapierHookEvents.socialForumWithWrapTopicCreated,
            constants.zapierHookEvents.guestInvitationHistory,
           ] 
          },
          targetUrl: { type : Sequelize.STRING, allowNull: false, validate: { isUrl: true }},
          accountId: { type: Sequelize.INTEGER,  allowNull: false, references: { model: 'Accounts', key: 'id' }},
          createdAt: Sequelize.DATE,
          updatedAt: Sequelize.DATE
        }).then(() => {          
          queryInterface.addIndex('ZapierSubscriptions', ['event', 'accountId'] ).then(() => {
            resolve();
          }, (error) => {
            validateError(error, resolve, reject);
          });
        }, (error) => {
           validateError(error, resolve, reject);
          reject(error);
        });
    });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.dropTable('ZapierSubscriptions');
   }
 };