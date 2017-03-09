'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('SubscriptionPlans', 'canBuySms', { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false }).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
     });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('SubscriptionPlans', 'canBuySms');
   }
 };
