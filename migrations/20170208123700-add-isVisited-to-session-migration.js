'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
        queryInterface.addColumn('Sessions', 'isVisited', { type: Sequelize.JSON, allowNull: false, defaultValue: {
            setUp: false, 
            facilitatiorAndTopics: false, 
            manageSessionEmails: false,
            manageSessionParticipants: false,
            inviteSessionObservers: false 
       }}).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('Sessions', 'isVisited');
   }
 };