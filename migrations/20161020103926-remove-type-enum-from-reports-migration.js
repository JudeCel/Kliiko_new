'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.removeColumn('SessionTopicsReports', 'enum_SessionTopicsReports_type').then(function() {
        resolve();
      },function(error) {
        validateError(error, resolve, reject);
      });

    });
  },
  down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('SessionTopicsReports', 'type');
   }
 };
