'use strict';
const Bluebird = require('bluebird');
const models = require('../models');
const _ = require('lodash');

module.exports = {
  call
};

function call() {
  return new Bluebird((resolve, reject) => {
    let names = [
      "Default Focus Video",
      "Default Forum Video"
    ]
    let count = names.length;

    _.map(names, function(name, index) {
      let newName = name.replace("Default ","");

      models.Resource.update({
        name: newName
      }, {
        where: {
          name: name
        },
        returning: true
      }).then(function(resource) {
        if(count == index + 1) {
          resolve();
        }

      }).catch(function (err) {
        reject(err);
      });
    });
  });
}
