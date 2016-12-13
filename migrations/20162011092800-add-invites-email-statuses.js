'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError
 var constants = require('../util/constants');


 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.addColumn('Invites', 'emailStatus',
       { type: Sequelize.ENUM, allowNull: false, values: constants.inviteEmailStatuses, defaultValue: 'waiting' }
     ).then(function() {
         resolve();
       },function(error) {
         validateError(error, resolve, reject);
       });
   });

   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('Invites', 'emailStatus');
   }
 };
