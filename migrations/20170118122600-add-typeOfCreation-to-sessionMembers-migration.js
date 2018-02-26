'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('SessionMembers', 'typeOfCreation', { type: Sequelize.ENUM, allowNull: false, values: ['system', 'invite'], defaultValue: 'invite'}).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('SessionMembers', 'typeOfCreation');
   }
 };
