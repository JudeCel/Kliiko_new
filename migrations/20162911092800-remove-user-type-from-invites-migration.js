'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.removeColumn('Invites', 'userType').then(function() {
         resolve();
       },function(error) {
         validateError(error, resolve, reject);
       });
   });
   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.addColumn('Invites', 'userType', { type: Sequelize.ENUM, allowNull: false, values: ['existing', 'new'], defaultValue: 'existing' });
   }
 };
