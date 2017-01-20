'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addIndex(
           'SessionMembers',
           ['typeOfCreation']
         ).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeIndex('SessionMembers', 'typeOfCreation');
   }
 };
