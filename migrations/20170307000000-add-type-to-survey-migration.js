'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError
 var constants = require('../util/constants');

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
       queryInterface.addColumn('Surveys', 'surveyType', { type: Sequelize.ENUM, allowNull: false, values: Object.keys(constants.surveyTypes), defaultValue: constants.surveyTypes.recruiter}).then(() => {
         resolve();
       }, (error) => {
         validateError(error, resolve, reject);
       });
   });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn('Surveys', 'type');
   }
 };
