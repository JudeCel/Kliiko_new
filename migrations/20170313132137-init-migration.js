'use strict';
var models = require("../models");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return models.sequelize.sync();
  }
};
