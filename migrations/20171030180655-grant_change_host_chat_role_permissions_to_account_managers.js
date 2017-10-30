'use strict';
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError;
let sessionTypeService = require('./../services/sessionType');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      sessionTypeService.updateSessionTypes()
        .then(() => {
          return queryInterface.sequelize.query(
            'UPDATE "SessionMembers" SET role = \'participant\' WHERE role = \'observer\' and "typeOfCreation" = \'system\'',
          );
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          validateError(error, resolve, reject);
        });
    });
  },
  down: function (queryInterface, Sequelize) {
    // NOTE: it is tricky to revert changes of "sessionTypeService.updateSessionTypes()"
    // you need to run task ./tasks/updateSessionTypes.js on relevant revision
    return queryInterface.sequelize.query(
      'UPDATE "SessionMembers" SET role = \'observer\' WHERE role = \'participant\' and "typeOfCreation" = \'system\'',
    );
  },
};
