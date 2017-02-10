'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('Shapes', 'eventType', { type: Sequelize.STRING, allowNull: true}).then(() => {
          queryInterface.addIndex(
            'Shapes',
            {
              fields: ['eventType']
            }).then(() => {
            resolve();
          }, (error) => {
            validateError(error, resolve, reject);
          });
       }, (error) => {
         validateError(error, resolve, reject);
       });
     });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('Shapes', 'eventType');
   }
 };
