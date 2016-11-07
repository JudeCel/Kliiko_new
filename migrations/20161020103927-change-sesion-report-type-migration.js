'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.addColumn('SessionTopicsReports', 'type', { type: Sequelize.STRING, allowNull: false }).then(function() {
        validateError(error, resolve, reject);
      },function(error) {
        validateError(error, resolve, reject);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('SessionTopicsReports', 'type');
   }
 };
