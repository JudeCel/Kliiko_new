'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.addColumn('Messages', 'childrenStars', { type: Sequelize.ARRAY(Sequelize.INTEGER), allowNull: false, defaultValue: [] }).then(function() {
         resolve();
       },function(error) {
         validateError(error, resolve, reject);
       });
   });
   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('Messages', 'childStars');
   }
 };
