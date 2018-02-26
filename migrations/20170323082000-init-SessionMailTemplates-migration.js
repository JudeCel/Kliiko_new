'use strict';

let models = require("../models");
let Bluebird = require('bluebird');
let validateError = require('./helpers/errorFilter.js').validateError

module.exports = {
  up: (queryInterface, Sequelize) => {
    return new Bluebird((resolve, reject) => {
      models.sequelize.sync().then(() => {
        return populateSessionMailTemplates();
      }).then(() => {
        return queryInterface.removeColumn('MailTemplates', 'sessionId');
      }).then(() => {
        resolve();
      }).catch((error) => {
        validateError(error, resolve, reject);
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return new Bluebird((resolve, reject) => {
      reject("Should newer do this!");
    });
  }
};

function populateSessionMailTemplates() {
  return new Bluebird((resolve, reject) => {
    models.MailTemplate.findAll({
      attributes: ['id', 'sessionId'],
      where: {
        sessionId: { $ne: null }
      }
    }).then((result) => {
      Bluebird.each(result, (item) => {
        return models.SessionMailTemplate.create({ mailTemplateId: item.dataValues.id, sessionId: item.dataValues.sessionId });
      }).then(function() {
        resolve();
      }, function(error) {
        reject(error);
      });
    }, (error) => {
      reject(error);
    });
  });
}
