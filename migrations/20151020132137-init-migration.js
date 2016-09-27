'use strict';
var models = require("../models");

module.exports = {
  up: function (queryInterface, Sequelize) {
    return models.sequelize.sync();
  }
};
