'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError
var constants = require('../util/constants');

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('AccountUsers', 'emailNotification', { type: Sequelize.ENUM, allowNull: false, values: constants.emailNotifications, defaultValue: 'all'}).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('AccountUsers', 'emailNotification');
   }
 };
