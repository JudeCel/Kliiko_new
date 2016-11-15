'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('SessionTopicsReports', 'sessionTopicId',
        { type: Sequelize.INTEGER, allowNull: true }
      ).then(function() {
        resolve();
      },function(error) {
        validateError(error, resolve, reject);
      });
   });
   },
   down: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
      queryInterface.changeColumn('SessionTopicsReports', 'sessionTopicId',
        { type: Sequelize.INTEGER, allowNull: false }
      ).then(function() {
        resolve();
      },function(error) {
        validateError(error, resolve, reject);
      });
   });
   }
 };