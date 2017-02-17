'use strict';

let models = require('./../models');
let { SessionType } = models;
let Bluebird = require('bluebird');
let sessionTypesConstants = require('./../util/sessionTypesConstants');

//for tasks, migrations and in fixtures
function updateSessionTypes() {
  return new Bluebird((resolve, reject) => {
    var types = Object.keys(sessionTypesConstants);
    Bluebird.each(types, (type) => {

      return new Bluebird(function (resolveItem, rejectItem) {
        SessionType.find({ where: { name: type } }).then(function(sessionType) {

          if (sessionType) {
            sessionType.update({ properties: sessionTypesConstants[type] }).then(function() {
              resolveItem();
            }, function(error) {
              rejectItem(error);
            });
          } else {
            SessionType.create({ name: type, properties: sessionTypesConstants[type] }).then(function() {
              resolveItem();
            }, function(error) {
              rejectItem(error);
            });
          }

        }, function(error){
          rejectItem(error);
        });
      });

    }).then(function() {
      resolve();
    }, function(error) {
      reject(error);
    });
  });
}

module.exports = {
  updateSessionTypes: updateSessionTypes
};
