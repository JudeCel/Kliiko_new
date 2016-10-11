'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 let Sequelize = require('sequelize');
 let env       = process.env.NODE_ENV || 'development';
 let config    = require(__dirname + '/../config/config.js')[env];
 let sequelize = new Sequelize(config.database, config.username, config.password, config);

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.addColumn('Sessions', 'type', { type: Sequelize.ENUM, values: ['focus', 'forum'] }).then(function(result) {
         sequelize.query('UPDATE public."Sessions" SET type = \'focus\'').then(function() {
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
