'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.addColumn('Sessions', 'type', { type: Sequelize.ENUM, values: ['focus', 'forum'] }).then(function(result) {
         queryInterface.sequelize.query('UPDATE public."Sessions" SET type = \'focus\'').then(function() {
           resolve();
         },function(error) {
           validateError(error, resolve, reject);
         });
       },function(error) {
         validateError(error, resolve, reject);
       });
   });
   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('Sessions', 'type');
   }
 };
