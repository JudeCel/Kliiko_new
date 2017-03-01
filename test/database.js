'use strict';

let Bluebird = require('bluebird');
let sessionTypeService = require('./../services/sessionType');
var models = require("../models");
const TransactionPool = require('../lib/transactionPool');

function prepareDatabaseForTests() {
  return new Bluebird((resolve, reject) => {
    models.sequelize.sync({ force: true }).then(() => {
        models.sequelize.transactionPool = new TransactionPool();
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
