'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       queryInterface.addColumn('AccountUsers', 'invitesInfo', { type: Sequelize.JSON, allowNull: false, defaultValue: {NoInFuture: 0, NotAtAll: 0, Invites: 0, NoReply: 0, NotThisTime: 0, Future: "-", Accept: 0, LastSession: "-"} }).then(function() {
         resolve();
       },function(error) {
         validateError(error, resolve, reject);
       });
   });
   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.removeColumn('AccountUsers', 'invitesInfo');
   }
 };
