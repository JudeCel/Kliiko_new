'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('Accounts', 'currency', { type: Sequelize.STRING, allowNull: false, defaultValue: 'AUD' }).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
     });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('Accounts', 'currency');
   }
 };
