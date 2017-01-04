'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError
let models = require("../models");

 module.exports = {
   up: function (queryInterface, Sequelize) {
     return new Bluebird(function (resolve, reject) {
       //sequelize.sync will create MailTemplateResources table and all reuired constraints, it will not touch other tables
       //http://docs.sequelizejs.com/en/v3/docs/schema/
       models.sequelize.sync({ force: false }).then(function() {
         resolve();
       },function(error) {
         validateError(error, resolve, reject);
       });
   });
   },
   down: function (queryInterface, Sequelize) {
     return queryInterface.dropTable('MailTemplateResources');
   }
 };
