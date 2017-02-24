'use strict';

let Bluebird = require('bluebird');
let sessionTypeService = require('./../services/sessionType');
var models = require("../models");

function prepareDatabaseForTests() {
  return new Bluebird((resolve, reject) => {
    models.sequelize.sync({ force: true }).then(() => {
      return sessionTypeService.updateSessionTypes();
    }).then(() => {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

module.exports = {
  prepareDatabaseForTests: prepareDatabaseForTests
};
