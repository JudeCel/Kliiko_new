'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addIndex(
           'MailTemplates',
           {
               name: 'compositeAccountIdMailTemplateBaseIdAndTemplateName',
               unique: true,
               fields: ['name', 'AccountId', 'MailTemplateBaseId']
            }
         ).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex(
        'SessionMembers', 
        {
            name: 'compositeAccountIdMailTemplateBaseIdAndTemplateName',
            unique: true,
            fields: ['name', 'AccountId', 'MailTemplateBaseId']
        });
   }
 };
